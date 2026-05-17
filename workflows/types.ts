export type LinkedInRoomPipelineInput = {
  audienceRoomId: string;
  enterpriseName?: string;
  model?: string;
  filterTier?: "1" | "2" | "both";
  stimulusTiers?: "both" | "tier1" | "tier2";
  groundTruthTiers?: "both" | "tier1" | "tier2";
  initialPredictionTier?: 1 | 2;
  sgoTierMode?: "tier1" | "tier2";
  sgoNumIterations?: number;
  /** Phase 1: false (i0 only). Set true when SGO is ready. */
  runSgoPipeline?: boolean;
  pollIntervalSeconds?: number;
  pollTimeoutSeconds?: number;
};

export type AsyncJobStatusPayload = {
  job_id: string;
  status: string;
  error?: string | null;
  result?: unknown;
};

export type ChunkProcessResult = {
  job_id: string;
  status: string;
  needs_continue: boolean;
};
