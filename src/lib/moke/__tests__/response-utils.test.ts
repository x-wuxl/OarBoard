import { describe, expect, it } from 'vitest';

import { MokeApiError } from '../client.js';
import { getMokeErrorMessage, getWorkoutTotalsSportCount } from '../response-utils.js';

describe('getWorkoutTotalsSportCount', () => {
  it('returns 0 when the upstream payload is missing the nested data object', () => {
    expect(getWorkoutTotalsSportCount({
      code: '606',
    } as never)).toBe(0);
  });
});

describe('getMokeErrorMessage', () => {
  it('maps unauthorized upstream errors to the user-facing token-expired copy', () => {
    expect(getMokeErrorMessage(new MokeApiError(
      'Moke API returned code 606: oauthtoken error',
      401,
      null,
      'unauthorized',
    ))).toBe('MOKE_AUTHORIZATION may be expired. Update your token in the environment variables.');
  });
});
