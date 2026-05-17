import {
  appendEnterpriseQuery,
  appendWorkflowOrchestrated,
  getApiUrl,
} from "@/lib/fastapi-url";
import type {
  AsyncJobStatusPayload,
  ChunkProcessResult,
  LinkedInRoomPipelineInput,
} from "@/workflows/types";

async function readJsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 800)}`);
  }
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Invalid JSON from API: ${text.slice(0, 200)}`);
  }
}

function parseChunkProcess(body: unknown, jobId: string): ChunkProcessResult {
  const row = body as Record<string, unknown>;
  return {
    job_id: typeof row.job_id === "string" ? row.job_id : jobId,
    status: typeof row.status === "string" ? row.status : "UNKNOWN",
    needs_continue: row.needs_continue === true,
  };
}

export async function stepRebuildTieredPosts(
  input: LinkedInRoomPipelineInput,
): Promise<Record<string, unknown>> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/rebuild-tiered-posts`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
  const res = await fetch(url.toString(), { method: "POST" });
  return (await readJsonOrThrow(res)) as Record<string, unknown>;
}

export async function stepFilterTieredPosts(
  input: LinkedInRoomPipelineInput,
): Promise<Record<string, unknown>> {
  "use step";

  const base = getApiUrl();
  const tier = input.filterTier ?? "both";
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/filter-tiered-posts`,
  );
  url.searchParams.set("tier", tier);
  appendEnterpriseQuery(url, input.enterpriseName);
  const res = await fetch(url.toString(), { method: "POST" });
  return (await readJsonOrThrow(res)) as Record<string, unknown>;
}

export async function stepTriggerThemeDiscovery(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/theme_category_discovery/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  const res = await fetch(url.toString(), { method: "POST" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  const jobId = body.job_id;
  if (typeof jobId !== "string" || !jobId) {
    throw new Error("theme_category_discovery/async: missing job_id");
  }
  return { job_id: jobId };
}

export async function stepTriggerStimulus(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/contextual-stimulus-categorization/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  url.searchParams.set("tiers", input.stimulusTiers ?? "both");
  const res = await fetch(url.toString(), { method: "POST" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  const jobId = body.job_id;
  if (typeof jobId !== "string" || !jobId) {
    throw new Error("contextual-stimulus-categorization/async: missing job_id");
  }
  return { job_id: jobId };
}

export async function stepProcessStimulusChunk(
  input: LinkedInRoomPipelineInput,
  jobId: string,
): Promise<ChunkProcessResult> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/contextual-stimulus-categorization/async/process`,
  );
  url.searchParams.set("jobId", jobId);
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  const res = await fetch(url.toString(), { method: "POST" });
  return parseChunkProcess(await readJsonOrThrow(res), jobId);
}

export async function stepTriggerGroundTruth(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/ground-truth-extraction/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  url.searchParams.set("tiers", input.groundTruthTiers ?? "both");
  const res = await fetch(url.toString(), { method: "POST" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  const jobId = body.job_id;
  if (typeof jobId !== "string" || !jobId) {
    throw new Error("ground-truth-extraction/async: missing job_id");
  }
  return { job_id: jobId };
}

export async function stepProcessGroundTruthChunk(
  input: LinkedInRoomPipelineInput,
  jobId: string,
): Promise<ChunkProcessResult> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/ground-truth-extraction/async/process`,
  );
  url.searchParams.set("jobId", jobId);
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  const res = await fetch(url.toString(), { method: "POST" });
  return parseChunkProcess(await readJsonOrThrow(res), jobId);
}

export async function stepTriggerInitialPrediction(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-initial-prediction/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  url.searchParams.set("tier", String(input.initialPredictionTier ?? 1));
  const res = await fetch(url.toString(), { method: "POST" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  const jobId = body.job_id;
  if (typeof jobId !== "string" || !jobId) {
    throw new Error("linkedin-initial-prediction/async: missing job_id");
  }
  return { job_id: jobId };
}

export async function stepProcessInitialPredictionChunk(
  input: LinkedInRoomPipelineInput,
  jobId: string,
): Promise<ChunkProcessResult> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-initial-prediction/async/process`,
  );
  url.searchParams.set("jobId", jobId);
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  const res = await fetch(url.toString(), { method: "POST" });
  return parseChunkProcess(await readJsonOrThrow(res), jobId);
}

export async function stepTriggerSgoPipeline(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-sgo-pipeline/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  url.searchParams.set("tierMode", input.sgoTierMode ?? "tier1");
  url.searchParams.set("numIterations", String(input.sgoNumIterations ?? 5));
  const res = await fetch(url.toString(), { method: "POST" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  const jobId = body.job_id;
  if (typeof jobId !== "string" || !jobId) {
    throw new Error("linkedin-sgo-pipeline/async: missing job_id");
  }
  return { job_id: jobId };
}

export async function stepProcessSgoChunk(
  input: LinkedInRoomPipelineInput,
  jobId: string,
): Promise<ChunkProcessResult> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-sgo-pipeline/async/process`,
  );
  url.searchParams.set("jobId", jobId);
  appendEnterpriseQuery(url, input.enterpriseName);
  appendWorkflowOrchestrated(url);
  if (input.model) {
    url.searchParams.set("model", input.model);
  }
  const res = await fetch(url.toString(), { method: "POST" });
  return parseChunkProcess(await readJsonOrThrow(res), jobId);
}

export type AsyncJobKind =
  | "theme"
  | "stimulus"
  | "ground_truth"
  | "initial_prediction"
  | "sgo";

export async function stepGetAsyncJobStatus(
  input: LinkedInRoomPipelineInput,
  jobId: string,
  kind: AsyncJobKind,
): Promise<AsyncJobStatusPayload> {
  "use step";

  const base = getApiUrl();
  let path: string;
  switch (kind) {
    case "theme":
      path = `/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/theme_category_discovery/async/status/${encodeURIComponent(jobId)}`;
      break;
    case "stimulus":
      path = `/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/contextual-stimulus-categorization/async/status/${encodeURIComponent(jobId)}`;
      break;
    case "ground_truth":
      path = `/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/ground-truth-extraction/async/status/${encodeURIComponent(jobId)}`;
      break;
    case "initial_prediction":
      path = `/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-initial-prediction/async/status/${encodeURIComponent(jobId)}`;
      break;
    case "sgo":
      path = `/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-sgo-pipeline/async/status/${encodeURIComponent(jobId)}`;
      break;
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown job kind: ${_exhaustive}`);
    }
  }
  const url = new URL(`${base}${path}`);
  appendEnterpriseQuery(url, input.enterpriseName);
  const res = await fetch(url.toString(), { method: "GET" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  return {
    job_id: typeof body.job_id === "string" ? body.job_id : jobId,
    status: typeof body.status === "string" ? body.status : "UNKNOWN",
    error:
      body.error === null || body.error === undefined
        ? null
        : String(body.error),
    result: body.result,
  };
}
