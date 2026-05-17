# vectorial-sgo-linkedin-testing (Vercel)

**Production URL:** https://vectorial-sgo-linkedin-testing.vercel.app

## Vercel env (required)

Choose **one** backend wiring:

| Mode | Vercel env vars |
|------|-----------------|
| **Rewrite (one public URL)** | `AUDIENCE_BACKEND_REWRITE_TARGET=https://your-audience-api.example.com` — steps use `VERCEL_URL`; `/api/v1/*` proxies to Python |
| **Direct** | `FASTAPI_URL` or `AUDIENCE_BACKEND_URL` = Audience API origin (no trailing slash) |

Audience **Python** service must include the Phase 1 `workflowOrchestrated` changes from the main `Audience-workflow` repo.

## Start pipeline (through i0; SGO off)

```bash
export ORIGIN="https://vectorial-sgo-linkedin-testing.vercel.app"
export ROOM_ID="your-audience-room-id"

curl -sS -X POST "$ORIGIN/api/workflows/linkedin-room-pipeline" \
  -H "content-type: application/json" \
  -d "{
    \"audienceRoomId\": \"$ROOM_ID\",
    \"enterpriseName\": \"gamma\",
    \"runSgoPipeline\": false
  }"
```

## Poll

```bash
curl -sS "$ORIGIN/api/workflows/linkedin-room-pipeline?runId=YOUR_RUN_ID"
```

## Smoke script

```bash
export ORIGIN="https://vectorial-sgo-linkedin-testing.vercel.app"
export ROOM_ID="..."
./scripts/smoke-trigger.sh
```

## Redeploy after code changes

Push to the branch connected to this Vercel project, or from `apps/vectorial_sgo_linkedin_testing`:

```bash
npx vercel --prod
```
