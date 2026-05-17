import { FatalError, sleep } from "workflow";
import type { AsyncJobStatusPayload, LinkedInRoomPipelineInput } from "@/workflows/types";
import { runWorkflowChunkedAsyncJob } from "@/workflows/run-chunked-async-job";
import {
  stepFilterTieredPosts,
  stepGetAsyncJobStatus,
  stepProcessGroundTruthChunk,
  stepProcessInitialPredictionChunk,
  stepProcessSgoChunk,
  stepProcessStimulusChunk,
  stepRebuildTieredPosts,
  stepTriggerGroundTruth,
  stepTriggerInitialPrediction,
  stepTriggerSgoPipeline,
  stepTriggerStimulus,
  stepTriggerThemeDiscovery,
} from "@/workflows/steps/linkedin-fastapi-steps";

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

async function waitForThemeJob(
  input: LinkedInRoomPipelineInput,
  jobId: string,
): Promise<AsyncJobStatusPayload> {
  const intervalSec = input.pollIntervalSeconds ?? 15;
  const timeoutSec = input.pollTimeoutSeconds ?? 7200;
  const maxIterations = Math.max(1, Math.ceil(timeoutSec / intervalSec));

  for (let attempt = 0; attempt < maxIterations; attempt++) {
    const row = await stepGetAsyncJobStatus(input, jobId, "theme");
    const st = String(row.status || "").toUpperCase();
    if (st === "COMPLETED") {
      return row;
    }
    if (st === "FAILED") {
      throw new FatalError(
        `theme_category_discovery failed: ${row.error ?? "no error detail"}`,
      );
    }
    await sleep(`${intervalSec}s`);
  }

  throw new FatalError(
    `theme_category_discovery timed out after ${timeoutSec}s`,
  );
}

export async function linkedinRoomPipelineWorkflow(
  input: LinkedInRoomPipelineInput,
): Promise<{
  audienceRoomId: string;
  theme: AsyncJobStatusPayload;
  stimulus: AsyncJobStatusPayload;
  groundTruth: AsyncJobStatusPayload;
  initialPrediction: AsyncJobStatusPayload;
  sgo?: AsyncJobStatusPayload;
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
  const theme = await waitForThemeJob(input, themeJob.job_id);

  const stimulus = await runWorkflowChunkedAsyncJob(
    input,
    "stimulus",
    "contextual-stimulus-categorization",
    () => stepTriggerStimulus(input),
    (jobId) => stepProcessStimulusChunk(input, jobId),
  );

  const groundTruth = await runWorkflowChunkedAsyncJob(
    input,
    "ground_truth",
    "ground-truth-extraction",
    () => stepTriggerGroundTruth(input),
    (jobId) => stepProcessGroundTruthChunk(input, jobId),
  );

  const initialPrediction = await runWorkflowChunkedAsyncJob(
    input,
    "initial_prediction",
    "linkedin-initial-prediction",
    () => stepTriggerInitialPrediction(input),
    (jobId) => stepProcessInitialPredictionChunk(input, jobId),
  );

  const runSgo = input.runSgoPipeline === true;
  let sgo: AsyncJobStatusPayload | undefined;
  if (runSgo) {
    const numIt = Math.max(1, input.sgoNumIterations ?? 5);
    sgo = await runWorkflowChunkedAsyncJob(
      input,
      "sgo",
      "linkedin-sgo-pipeline",
      () => stepTriggerSgoPipeline(input),
      (jobId) => stepProcessSgoChunk(input, jobId),
      numIt + 4,
    );
  }

  return {
    audienceRoomId: input.audienceRoomId,
    theme,
    stimulus,
    groundTruth,
    initialPrediction,
    sgo,
  };
}
