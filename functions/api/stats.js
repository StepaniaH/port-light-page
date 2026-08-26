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
const FALLBACK = { stars: 47, pulls: 4745, version: 'v0.7.2' };
const TTL = 3600;

async function metric(url, options, pick) {
  const cache = globalThis.caches?.default;
  const key = new Request(`https://stats-cache.internal/${url}`);
  try {
    const r = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const v = pick(await r.json());
    if (v != null) {
      if (cache) await cache.put(key, Response.json({ v }));
      return { v, fresh: true };
    }
  } catch { /* upstream hiccup — fall through to last known good */ }
  if (cache) {
    const cached = await cache.match(key);
    if (cached) return { v: (await cached.json()).v, fresh: false };
  }
  return { v: null, fresh: false };
}

export async function onRequest({ env = {} } = {}) {
  const ghHeaders = {
    'user-agent': 'port-light-page',
    accept: 'application/vnd.github+json',
    ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
  };
  const [pulls, stars, version] = await Promise.all([
    metric(DOCKER_UPSTREAM, {}, (d) => (Number.isFinite(d.pull_count) && d.pull_count >= 0 ? d.pull_count : null)),
    metric(GITHUB_REPO, { headers: ghHeaders }, (d) => (Number.isFinite(d.stargazers_count) && d.stargazers_count >= 0 ? d.stargazers_count : null)),
    metric(GITHUB_RELEASE, { headers: ghHeaders }, (d) => (/^v\d+\.\d+\.\d+/.test(d.tag_name ?? '') ? d.tag_name : null)),
  ]);
  const out = {
    pulls: pulls.v ?? FALLBACK.pulls,
    stars: stars.v ?? FALLBACK.stars,
    version: version.v ?? FALLBACK.version,
  };
  const fresh = [pulls, stars, version].filter((m) => m.fresh).length;
  return new Response(JSON.stringify(out), {
    headers: {
      'content-type': 'application/json',
      'x-stats-upstreams-fresh': `${fresh}/3`,
      // Values are last-known-good, so a short browser cache is enough;
      // the hour-level caching happens per-metric inside this function.
      'cache-control': 'public, max-age=60',
    },
  });
}
