/**
 * Cloudflare Worker in front of the static build.
 *
 * Static assets are served directly by the platform and never reach this
 * script; it only runs when nothing on disk matches the path. That happens in
 * exactly two cases: a shared-result URL, which is dynamic by nature and has no
 * file of its own, and a genuine 404.
 */

/** /r/<slug> — ten characters from the share alphabet, trailing slash optional. */
const SHARE_PATH = /^\/r\/[a-z0-9]{6,32}\/?$/;

/**
 * Result pages moved a level down when the family URLs became hubs. These
 * carry no search value — they are noindex and useless without a session — but
 * someone may have bookmarked one.
 */
const MOVED = new Map([
  ['/breakup/result', '/breakup/quick/result'],
  ['/divorce/result', '/divorce/quick/result'],
  ['/twilight/result', '/twilight/quick/result'],
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const moved = MOVED.get(url.pathname.replace(/\/$/, ''));
    if (moved) {
      return Response.redirect(new URL(moved, url.origin).href, 301);
    }

    if (SHARE_PATH.test(url.pathname)) {
      // One shell for every share link. The page reads the slug back out of
      // location.pathname and fetches the row itself.
      const shell = await env.ASSETS.fetch(new URL('/r/index.html', url.origin));
      return new Response(shell.body, {
        status: shell.status,
        headers: shell.headers,
      });
    }

    const notFound = await env.ASSETS.fetch(new URL('/404.html', url.origin));
    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};
