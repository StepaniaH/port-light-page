// Pages Function — Docker Hub sends no CORS headers, so the browser cannot
// query it directly; proxy server-side with edge caching. Also relays GitHub
// stars and the latest release tag so the page never shows stale baked values.
// Visitors never hit api.github.com directly (60 req/h per IP); everything
// funnels through here behind s-maxage. Set a GITHUB_TOKEN secret (fine-grained,
// public repos read-only) to raise the upstream rate limit.
const DOCKER_UPSTREAM = 'https://hub.docker.com/v2/repositories/stepaniah/port-light/';
const GITHUB_REPO = 'https://api.github.com/repos/StepaniaH/port-light';
const GITHUB_RELEASE = 'https://api.github.com/repos/StepaniaH/port-light/releases/latest';
const FALLBACK = { stars: 47, pulls: 4745, version: 'v0.7.2' };

function respond(body, upstreamOk) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json',
      // Pin successful reads at the edge for an hour; if every upstream
      // failed (transient or rate-limited), cache only briefly so the next
      // request retries instead of serving stale fallbacks.
      'cache-control': upstreamOk
        ? 'public, s-maxage=3600, stale-while-revalidate=86400'
        : 'public, max-age=60',
    },
  });
}

export async function onRequest({ env = {} } = {}) {
  const out = { ...FALLBACK };
  let ok = 0;
  try {
    const r = await fetch(DOCKER_UPSTREAM, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const pulls = Number((await r.json()).pull_count);
    if (Number.isFinite(pulls) && pulls >= 0) { out.pulls = pulls; ok++; }
  } catch { /* keep fallback pulls */ }
  const ghHeaders = {
    'user-agent': 'port-light-page',
    accept: 'application/vnd.github+json',
    ...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
  };
  try {
    const r = await fetch(GITHUB_REPO, {
      headers: ghHeaders,
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const stars = Number((await r.json()).stargazers_count);
    if (Number.isFinite(stars) && stars >= 0) { out.stars = stars; ok++; }
  } catch { /* keep fallback stars */ }
  try {
    const r = await fetch(GITHUB_RELEASE, {
      headers: ghHeaders,
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const tag = (await r.json()).tag_name;
    if (typeof tag === 'string' && /^v\d+\.\d+\.\d+/.test(tag)) { out.version = tag; ok++; }
  } catch { /* keep fallback version */ }
  return respond(out, ok > 0);
}
