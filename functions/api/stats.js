// Pages Function — Docker Hub sends no CORS headers, so the browser cannot
// query it directly; proxy server-side with edge caching. Also relays the
// latest release tag so the page never shows a stale baked version.
const DOCKER_UPSTREAM = 'https://hub.docker.com/v2/repositories/stepaniah/port-light/';
const GITHUB_UPSTREAM = 'https://api.github.com/repos/StepaniaH/port-light/releases/latest';
const FALLBACK = { pulls: 4745, version: 'v0.7.2' };

function respond(body) {
  return new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export async function onRequest() {
  const out = { ...FALLBACK };
  try {
    const r = await fetch(DOCKER_UPSTREAM, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const pulls = Number((await r.json()).pull_count);
    if (Number.isFinite(pulls) && pulls >= 0) out.pulls = pulls;
  } catch { /* keep fallback pulls */ }
  try {
    const r = await fetch(GITHUB_UPSTREAM, {
      headers: { 'user-agent': 'port-light-page', accept: 'application/vnd.github+json' },
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!r.ok) throw new Error(`upstream ${r.status}`);
    const tag = (await r.json()).tag_name;
    if (typeof tag === 'string' && /^v\d+\.\d+\.\d+/.test(tag)) out.version = tag;
  } catch { /* keep fallback version */ }
  return respond(out);
}
