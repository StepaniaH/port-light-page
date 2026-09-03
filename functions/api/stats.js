// Pages Function — Docker Hub sends no CORS headers, so the browser cannot
// query it directly; proxy server-side. Each metric is cached independently
// for an hour (caches.default) and served stale if its upstream hiccups, so
// a Docker Hub or GitHub outage never regresses the page to baked values.
// Visitors never hit api.github.com directly (60 req/h per IP). Set a
// GITHUB_TOKEN secret (fine-grained, public repos read-only) to raise the
// upstream rate limit.
const DOCKER_UPSTREAM = 'https://hub.docker.com/v2/repositories/stepaniah/port-light/';
const GITHUB_REPO = 'https://api.github.com/repos/StepaniaH/port-light';
const GITHUB_RELEASE = 'https://api.github.com/repos/StepaniaH/port-light/releases/latest';
const FALLBACK = { stars: 52, pulls: 8567, version: 'v0.7.8' };
const TTL = 3600;

async function metric(url, options, pick) {
  const cache = globalThis.caches?.default;
  const key = new Request(`https://stats-cache.internal/${url}`);
  let err = 'unknown';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, {
        accept: 'application/json',
        'user-agent': 'port-light-page/1.0 (+https://port-light-page.pages.dev)',
        ...options,
        signal: AbortSignal.timeout(3000),
        // Route the subrequest through the colo-shared edge cache: one
        // upstream 200 serves every Worker in the datacenter for an hour,
        // which matters because Docker Hub 429s Cloudflare's shared egress
        // IPs most of the time. Errors are cached only briefly.
        cf: { cacheEverything: true, cacheTtlByStatus: { ok: 3600, errors: 30 } },
      });
      if (!r.ok) throw new Error(`${r.status}`);
      const v = pick(await r.json());
      if (v != null) {
        if (cache) await cache.put(key, Response.json({ v }));
        return { v, fresh: true, err: null };
      }
      err = 'parse';
    } catch (e) {
      err = `${e?.message ?? e}`.slice(0, 24);
      if (attempt === 0) await new Promise((res) => setTimeout(res, 400));
    }
  }
  if (cache) {
    const cached = await cache.match(key);
    if (cached) return { v: (await cached.json()).v, fresh: false, err };
  }
  return { v: null, fresh: false, err };
}

// Hub API rate limits anonymous requests per IP — and Cloudflare's shared
// egress IPs are almost always exhausted (429). A Docker Hub access token
// (read-only, account settings → security) moves the quota to the account.
async function hubJwt(env = {}) {
  if (!env.DOCKER_HUB_USERNAME || !env.DOCKER_HUB_TOKEN) return null;
  try {
    const r = await fetch('https://hub.docker.com/v2/users/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: env.DOCKER_HUB_USERNAME, password: env.DOCKER_HUB_TOKEN }),
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return null;
    const { token } = await r.json();
    return typeof token === 'string' && token ? token : null;
  } catch {
    return null;
  }
}

export async function onRequest({ env = {} } = {}) {
  const ghHeaders = {
    'user-agent': 'port-light-page',
    accept: 'application/vnd.github+json',
    ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
  };
  const jwt = await hubJwt(env);
  const dockerOptions = jwt ? { headers: { authorization: `Bearer ${jwt}` } } : {};
  const [pulls, stars, version] = await Promise.all([
    metric(DOCKER_UPSTREAM, dockerOptions, (d) => (Number.isFinite(d.pull_count) && d.pull_count >= 0 ? d.pull_count : null)),
    metric(GITHUB_REPO, { headers: ghHeaders }, (d) => (Number.isFinite(d.stargazers_count) && d.stargazers_count >= 0 ? d.stargazers_count : null)),
    metric(GITHUB_RELEASE, { headers: ghHeaders }, (d) => (/^v\d+\.\d+\.\d+/.test(d.tag_name ?? '') ? d.tag_name : null)),
  ]);
  const out = {
    pulls: pulls.v ?? FALLBACK.pulls,
    stars: stars.v ?? FALLBACK.stars,
    version: version.v ?? FALLBACK.version,
  };
  const fresh = [pulls, stars, version].filter((m) => m.fresh).length;
  const detail = [['pulls', pulls], ['stars', stars], ['version', version]]
    .map(([n, m]) => `${n}:${m.fresh ? 'ok' : `err(${m.err})`}`).join(' ');
  return new Response(JSON.stringify(out), {
    headers: {
      'content-type': 'application/json',
      'x-stats-upstreams-fresh': `${fresh}/3 ${detail}`,
      // Values are last-known-good, so a short browser cache is enough;
      // the hour-level caching happens per-metric inside this function.
      'cache-control': 'public, max-age=60',
    },
  });
}
