#!/usr/bin/env bash
set -euo pipefail

ORIGIN="${ORIGIN:-https://vectorial-sgo-linkedin-testing.vercel.app}"
ROOM_ID="${ROOM_ID:?Set ROOM_ID}"
ENTERPRISE="${ENTERPRISE_NAME:-}"
POLL_SEC="${POLL_SEC:-20}"
MAX_POLLS="${MAX_POLLS:-360}"

BODY=$(jq -n \
  --arg room "$ROOM_ID" \
  --arg ent "$ENTERPRISE" \
  '{audienceRoomId: $room, runSgoPipeline: false}
   + (if $ent != "" then {enterpriseName: $ent} else {} end)')

echo "POST $ORIGIN/api/workflows/linkedin-room-pipeline"
START=$(curl -sS -X POST "$ORIGIN/api/workflows/linkedin-room-pipeline" \
  -H "content-type: application/json" \
  -d "$BODY")
echo "$START" | jq .

RUN_ID=$(echo "$START" | jq -r '.runId // empty')
if [[ -z "$RUN_ID" ]]; then
  echo "No runId" >&2
  exit 1
fi

for ((i = 1; i <= MAX_POLLS; i++)); do
  sleep "$POLL_SEC"
  STATUS=$(curl -sS "$ORIGIN/api/workflows/linkedin-room-pipeline?runId=$RUN_ID")
  echo "[$i] $(echo "$STATUS" | jq -c '{status: .status}')"
  ST=$(echo "$STATUS" | jq -r '.status // empty' | tr '[:upper:]' '[:lower:]')
  case "$ST" in
    completed|success) echo "$STATUS" | jq .; exit 0 ;;
    failed|error|cancelled) echo "$STATUS" | jq .; exit 1 ;;
  esac
done

echo "Timed out" >&2
exit 2
