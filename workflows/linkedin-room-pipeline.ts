import { FatalError, sleep } from "workflow";
import type { AsyncJobKind } from "@/workflows/steps/linkedin-fastapi-steps";
import {
  stepFilterTieredPosts,
  stepGetAsyncJobStatus,
  stepRebuildTieredPosts,
  stepTriggerGroundTruth,
  stepTriggerInitialPrediction,
  stepTriggerStimulus,
  stepTriggerThemeDiscovery,
} from "@/workflows/steps/linkedin-fastapi-steps";
import type { AsyncJobStatusPayload, LinkedInRoomPipelineInput } from "@/workflows/types";

function assertNotSkipped(
  label: string,
  body: Record<string, unknown>,
): void {
  if (body.skipped === true) {
    const reason =
      typeof body.reason === "string" ? body.reason : "skipped_no_reason";
    throw new FatalError(`${label} skipped: ${reason}`);
  }
}

async function waitForAsyncJob(
  input: LinkedInRoomPipelineInput,
  jobId: string,
  kind: AsyncJobKind,
  label: string,
): Promise<AsyncJobStatusPayload> {
  const intervalSec = input.pollIntervalSeconds ?? 15;
  const timeoutSec = input.pollTimeoutSeconds ?? 7200;
  const maxIterations = Math.max(1, Math.ceil(timeoutSec / intervalSec));

  for (let attempt = 0; attempt < maxIterations; attempt++) {
    const row = await stepGetAsyncJobStatus(input, jobId, kind);
    const st = String(row.status || "").toUpperCase();
    if (st === "COMPLETED") {
      return row;
    }
    if (st === "FAILED") {
      throw new FatalError(
        `${label} failed: ${row.error ?? "no error detail"}`,
      );
    }
    await sleep(`${intervalSec}s`);
  }

  throw new FatalError(`${label} timed out after ${timeoutSec}s`);
}

/**
 * Durable LinkedIn room pipeline: tier rebuild → filter → theme → stimulus →
 * ground truth → initial prediction. Calls Audience FastAPI (FASTAPI_URL).
 */
export async function linkedinRoomPipelineWorkflow(
  input: LinkedInRoomPipelineInput,
): Promise<{
  audienceRoomId: string;
  theme: AsyncJobStatusPayload;
  stimulus: AsyncJobStatusPayload;
  groundTruth: AsyncJobStatusPayload;
  initialPrediction: AsyncJobStatusPayload;
}> {
  "use workflow";

  if (!input.audienceRoomId?.trim()) {
    throw new FatalError("audienceRoomId is required");
  }

  const rebuild = await stepRebuildTieredPosts(input);
  assertNotSkipped("rebuild-tiered-posts", rebuild);

  const filtered = await stepFilterTieredPosts(input);
  assertNotSkipped("filter-tiered-posts", filtered);

  const themeJob = await stepTriggerThemeDiscovery(input);
  const theme = await waitForAsyncJob(
    input,
    themeJob.job_id,
    "theme",
    "theme_category_discovery",
  );

  const stimulusJob = await stepTriggerStimulus(input);
  const stimulus = await waitForAsyncJob(
    input,
    stimulusJob.job_id,
    "stimulus",
    "contextual-stimulus-categorization",
  );

  const gtJob = await stepTriggerGroundTruth(input);
  const groundTruth = await waitForAsyncJob(
    input,
    gtJob.job_id,
    "ground_truth",
    "ground-truth-extraction",
  );

  const i0Job = await stepTriggerInitialPrediction(input);
  const initialPrediction = await waitForAsyncJob(
    input,
    i0Job.job_id,
    "initial_prediction",
    "linkedin-initial-prediction",
  );

  return {
    audienceRoomId: input.audienceRoomId,
    theme,
    stimulus,
    groundTruth,
    initialPrediction,
  };
}
