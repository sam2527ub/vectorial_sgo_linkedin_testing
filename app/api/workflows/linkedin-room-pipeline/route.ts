import { NextResponse } from "next/server";
import { getRun, start } from "workflow/api";
import { linkedinRoomPipelineWorkflow } from "@/workflows/linkedin-room-pipeline";
import type { LinkedInRoomPipelineInput } from "@/workflows/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = body as Partial<LinkedInRoomPipelineInput>;
  if (!raw.audienceRoomId || String(raw.audienceRoomId).trim() === "") {
    return NextResponse.json(
      { error: "audienceRoomId is required" },
      { status: 400 },
    );
  }

  const input: LinkedInRoomPipelineInput = {
    audienceRoomId: String(raw.audienceRoomId).trim(),
    enterpriseName: raw.enterpriseName,
    model: raw.model,
    filterTier: raw.filterTier,
    stimulusTiers: raw.stimulusTiers,
    groundTruthTiers: raw.groundTruthTiers,
    initialPredictionTier: raw.initialPredictionTier,
    pollIntervalSeconds: raw.pollIntervalSeconds,
    pollTimeoutSeconds: raw.pollTimeoutSeconds,
  };

  const run = await start(linkedinRoomPipelineWorkflow, [input]);

  return NextResponse.json({
    runId: run.runId,
    message:
      "Workflow started. Poll GET /api/workflows/linkedin-room-pipeline?runId=…",
  });
}

export async function GET(request: Request) {
  const runId = new URL(request.url).searchParams.get("runId");
  if (!runId) {
    return NextResponse.json(
      { error: "runId query parameter is required" },
      { status: 400 },
    );
  }

  const run = getRun(runId);

  if (!(await run.exists)) {
    return NextResponse.json({ error: "Workflow run not found" }, { status: 404 });
  }

  const status = await run.status;

  return NextResponse.json({
    runId,
    status,
  });
}
