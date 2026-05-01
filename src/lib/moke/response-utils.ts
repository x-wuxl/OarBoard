import { MokeApiError } from './client';
import type { MokeWorkoutTotalsResponse } from './types';

const AUTH_EXPIRED_MESSAGE = 'MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getWorkoutTotalsSportCount(response: Partial<MokeWorkoutTotalsResponse> | null | undefined): number {
  if (!response || !isRecord(response) || !isRecord(response.data)) {
    return 0;
  }

  const sportCount = response.data.sportCount;
  return typeof sportCount === 'number' && Number.isFinite(sportCount) ? sportCount : 0;
}

export function getMokeErrorMessage(error: unknown): string {
  if (error instanceof MokeApiError && error.code === 'unauthorized') {
    return AUTH_EXPIRED_MESSAGE;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /401|403|oauthtoken|authorization token is invalid or expired/i.test(message)
    ? AUTH_EXPIRED_MESSAGE
    : message;
}
