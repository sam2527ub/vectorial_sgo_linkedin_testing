export type LinkedInRoomPipelineInput = {
  audienceRoomId: string;
  enterpriseName?: string;
  model?: string;
  /** Passed to filter-tiered-posts (default both). */
  filterTier?: "1" | "2" | "both";
  /** contextual-stimulus-categorization async tiers (default both). */
  stimulusTiers?: "both" | "tier1" | "tier2";
  /** ground-truth-extraction async tiers (default both). */
  groundTruthTiers?: "both" | "tier1" | "tier2";
  /** linkedin-initial-prediction tier (default 1). */
  initialPredictionTier?: 1 | 2;
  /** Seconds between async job status polls (default 15). */
  pollIntervalSeconds?: number;
  /** Max seconds to wait per async phase before failing (default 7200). */
  pollTimeoutSeconds?: number;
};

export type AsyncJobStatusPayload = {
  job_id: string;
  status: string;
  error?: string | null;
  result?: unknown;
};
