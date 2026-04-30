export default function Home() {
  return (
    <main>
      <h1>LinkedIn room pipeline orchestrator</h1>
      <p>
        This Next.js app runs on Vercel with the Workflow SDK. Set{" "}
        <code>FASTAPI_URL</code> to your deployed Audience FastAPI origin.
      </p>
      <p>
        On the FastAPI side, set <code>AUDIENCE_API_BASE_URL</code> to that same
        public API URL so chunked async jobs can POST to{" "}
        <code>…/async/process</code>.
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
        Standalone repo for testing; on Vercel leave <strong>Root Directory</strong>{" "}
        empty (repo root).
      </p>
    </main>
  );
}
