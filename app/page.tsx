const ORIGIN = "https://vectorial-sgo-linkedin-testing.vercel.app";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>LinkedIn room pipeline (Vercel Workflow)</h1>
      <p>
        <strong>Deployment:</strong>{" "}
        <a href={ORIGIN}>{ORIGIN}</a>
      </p>
      <p>
        Phase 1: rebuild → filter → theme → stimulus → ground truth → initial
        prediction. SGO only if <code>runSgoPipeline: true</code>.
      </p>

      <h2>Backend env on this Vercel project</h2>
      <ul>
        <li>
          <code>AUDIENCE_BACKEND_REWRITE_TARGET</code> = your Audience Python API
          (steps call this hostname; <code>/api/v1/*</code> rewrites), or
        </li>
        <li>
          <code>FASTAPI_URL</code> / <code>AUDIENCE_BACKEND_URL</code> = call API
          directly
        </li>
      </ul>

      <h2>Trigger (one call — do not chain FastAPI pipeline URLs)</h2>
      <pre>
        {`export ORIGIN="${ORIGIN}"

curl -sS -X POST "$ORIGIN/api/workflows/linkedin-room-pipeline" \\
  -H "content-type: application/json" \\
  -d '{"audienceRoomId":"<ROOM_ID>","enterpriseName":"gamma","runSgoPipeline":false}'`}
      </pre>
      <pre>{`curl -sS "$ORIGIN/api/workflows/linkedin-room-pipeline?runId=<RUN_ID>"`}</pre>

      <p>
        See <code>RUNBOOK.md</code> and <code>scripts/smoke-trigger.sh</code>.
        Redeploy after pulling Phase 1 workflow changes.
      </p>
    </main>
  );
}
