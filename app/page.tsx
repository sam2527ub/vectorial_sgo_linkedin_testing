export default function Home() {
  return (
    <main>
      <h1>LinkedIn room pipeline (test orchestrator)</h1>
      <p>
        End-to-end runs start here — same deployment you open in the browser (Workflow +
        route handlers). Audience-room HTTP calls use <code>getApiUrl()</code> in{" "}
        <code>lib/fastapi-url.ts</code>.
      </p>

      <h2>Configure only this Vercel project</h2>
      <ul>
        <li>
          <strong>Default (nothing to set):</strong> On Vercel, workflow steps use the
          automatic <code>VERCEL_URL</code> host — i.e. <strong>this same deployment URL</strong>.
          Use this when <code>/api/v1/...</code> and <code>/docs</code> are already served on
          this deployment.
        </li>
        <li>
          <strong>Optional proxy (single public URL, API elsewhere):</strong> set{" "}
          <code>AUDIENCE_BACKEND_REWRITE_TARGET</code> to your Audience API origin (no trailing
          slash). Then requests from this app to <code>/api/v1/...</code> on{" "}
          <strong>this</strong> URL are rewritten to that backend. Leave{" "}
          <code>FASTAPI_URL</code> unset so steps still target this hostname and hit the rewrite.
        </li>
        <li>
          <strong>Optional override:</strong> <code>FASTAPI_URL</code> or{" "}
          <code>AUDIENCE_BACKEND_URL</code> forces steps to call that origin directly (no rewrite
          needed for those fetches).
        </li>
      </ul>

      <p>
        <code>AUDIENCE_API_BASE_URL</code> is <strong>not</strong> read by this Next app — it
        belongs to the <strong>Python</strong> Audience service for internal chunk self-POSTs.
        You do not add it to this project&apos;s env unless you also run that Python code from
        here (you typically don&apos;t).
      </p>

      <h2>Trigger</h2>
      <pre>
        {`curl -sS -X POST \\
  "$ORIGIN/api/workflows/linkedin-room-pipeline" \\
  -H "content-type: application/json" \\
  -d '{"audienceRoomId":"<ROOM_ID>","enterpriseName":"gamma"}'`}
      </pre>
      <h2>Status</h2>
      <pre>
        {`curl -sS "$ORIGIN/api/workflows/linkedin-room-pipeline?runId=<RUN_ID>"`}
      </pre>
      <p>
        Example: <code>ORIGIN=https://vectorial-sgo-linkedin-testing.vercel.app</code>. Root
        directory on Vercel: repo root.
      </p>
    </main>
  );
}
