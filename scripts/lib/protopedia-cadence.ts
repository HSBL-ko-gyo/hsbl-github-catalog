export const DEFAULT_PROTOPEDIA_MIN_INTERVAL_SECONDS = 600;

export function protopediaMinimumIntervalMs(value?: string): number {
  const seconds = Number(
    value ?? String(DEFAULT_PROTOPEDIA_MIN_INTERVAL_SECONDS),
  );
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 86_400) {
    throw new Error(
      "HSBL_PROTOPEDIA_MIN_INTERVAL_SECONDS must be an integer from 1 to 86400",
    );
  }
  return seconds * 1_000;
}

export function remainingPublicationDelayMs(
  previousAt: string | undefined,
  nowMs: number,
  minimumIntervalMs: number,
): number {
  if (!previousAt) return 0;
  const previousMs = Date.parse(previousAt);
  if (!Number.isFinite(previousMs)) {
    throw new Error("ProtoPedia publication cadence state has an invalid timestamp");
  }
  return Math.max(0, previousMs + minimumIntervalMs - nowMs);
}
