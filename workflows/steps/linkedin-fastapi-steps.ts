import { appendEnterpriseQuery, getApiUrl } from "@/lib/fastapi-url";
import type {
  AsyncJobStatusPayload,
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
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  return body;
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
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  return body;
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
    throw new Error("theme_category_discovery/async: missing job_id in response");
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

export async function stepTriggerGroundTruth(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/ground-truth-extraction/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
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

export async function stepTriggerInitialPrediction(
  input: LinkedInRoomPipelineInput,
): Promise<{ job_id: string }> {
  "use step";

  const base = getApiUrl();
  const url = new URL(
    `${base}/api/v1/audience-rooms/${encodeURIComponent(input.audienceRoomId)}/linkedin-initial-prediction/async`,
  );
  appendEnterpriseQuery(url, input.enterpriseName);
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

export type AsyncJobKind =
  | "theme"
  | "stimulus"
  | "ground_truth"
  | "initial_prediction";

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
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown job kind: ${_exhaustive}`);
    }
  }
  const url = new URL(`${base}${path}`);
  appendEnterpriseQuery(url, input.enterpriseName);
  const res = await fetch(url.toString(), { method: "GET" });
  const body = (await readJsonOrThrow(res)) as Record<string, unknown>;
  const status = body.status;
  return {
    job_id: typeof body.job_id === "string" ? body.job_id : jobId,
    status: typeof status === "string" ? status : "UNKNOWN",
    error:
      body.error === null || body.error === undefined
        ? null
        : String(body.error),
    result: body.result,
  };
}
