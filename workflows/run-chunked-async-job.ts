import { FatalError } from "workflow";
import type {
  AsyncJobStatusPayload,
  ChunkProcessResult,
  LinkedInRoomPipelineInput,
} from "@/workflows/types";
import {
  stepGetAsyncJobStatus,
  type AsyncJobKind,
} from "@/workflows/steps/linkedin-fastapi-steps";

/**
 * Workflow-owned chunk loop: create job, process until needs_continue is false,
 * then return final job status. FastAPI does not HTTP self-trigger between chunks.
 */
export async function runWorkflowChunkedAsyncJob(
  input: LinkedInRoomPipelineInput,
  kind: AsyncJobKind,
  label: string,
  trigger: () => Promise<{ job_id: string }>,
  processChunk: (jobId: string) => Promise<ChunkProcessResult>,
  maxChunks = 5000,
): Promise<AsyncJobStatusPayload> {
  const { job_id } = await trigger();

  for (let i = 0; i < maxChunks; i++) {
    const chunk = await processChunk(job_id);
    const st = String(chunk.status || "").toUpperCase();
    if (st === "FAILED") {
      throw new FatalError(`${label} failed during chunk ${i + 1}`);
    }
    if (st === "COMPLETED" || !chunk.needs_continue) {
      break;
    }
  }

  const final = await stepGetAsyncJobStatus(input, job_id, kind);
  const finalStatus = String(final.status || "").toUpperCase();
  if (finalStatus === "FAILED") {
    throw new FatalError(`${label} failed: ${final.error ?? "no error detail"}`);
  }
  if (finalStatus !== "COMPLETED") {
    throw new FatalError(
      `${label} did not complete (status=${final.status ?? "unknown"})`,
    );
  }
  return final;
}
