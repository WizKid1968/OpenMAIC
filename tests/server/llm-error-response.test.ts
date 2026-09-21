import { describe, expect, it } from 'vitest';

import { getLlmErrorInfo, llmApiError } from '@/lib/server/llm-error-response';

describe('LLM provider error responses', () => {
  it('turns a 401 into an actionable, credential-safe message', async () => {
    const upstreamError = Object.assign(new Error('User not found.'), { statusCode: 401 });

    expect(getLlmErrorInfo(upstreamError)).toEqual({
      status: 401,
      code: 'UPSTREAM_ERROR',
      message: 'LLM provider authentication failed. Check the API key for the selected provider.',
    });

    const response = llmApiError(upstreamError);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'LLM provider authentication failed. Check the API key for the selected provider.',
    });
  });

  it('does not expose an upstream response body', () => {
    const upstreamError = {
      statusCode: 401,
      responseBody: '{"error":{"message":"User not found.","token":"secret"}}',
    };

    expect(JSON.stringify(getLlmErrorInfo(upstreamError))).not.toContain('secret');
  });
});
