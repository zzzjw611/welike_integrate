/**
 * Social Listening tool — embeds the standalone welike-social-listening
 * frontend (originally welike-social-listening-main/frontend/) verbatim via
 * iframe.
 *
 * The static assets live under web/public/social-listening-app/ so Vercel
 * serves them at https://<domain>/social-listening-app/. The iframe loads
 * that page; its app.js fetches /api/social-listening/... at the parent
 * origin (rewritten in app.js, so the relative paths resolve correctly).
 *
 * The dashboard layout (left sidebar + sticky language switcher header) is
 * preserved. We use negative margins to escape the layout's px-* and py-*
 * paddings so the iframe is edge-to-edge inside the main content area; the
 * existing max-w-5xl constraint stays — it matches the standalone app's
 * intended max width.
 */
export default function SocialListeningPage() {
  return (
    <div className="-mx-4 sm:-mx-8 -my-8">
      <iframe
        src="/social-listening-app/index.html"
        title="Social Listening"
        className="block w-full border-0 bg-black"
        style={{ height: "calc(100vh - 3rem)" }}
        // allow scripts + same-origin so app.js can fetch /api/social-listening/*
        // (sandbox not needed since this is our own static asset).
      />
    </div>
  );
}
