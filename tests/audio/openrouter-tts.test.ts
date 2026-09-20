import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateTTS, normalizeOpenRouterTTSModelId } from '@/lib/audio/tts-providers';

describe('OpenRouter TTS compatibility', () => {
  afterEach(() => vi.restoreAllMocks());

  it('repairs the persisted Fish Audio display label', () => {
    expect(
      normalizeOpenRouterTTSModelId('https://openrouter.ai/api/v1', 'S2.1 Pro Free'),
    ).toBe('fish-audio/s2.1-pro-free:free');
  });

  it('sends the wire model id and requests browser-playable MP3 audio', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([0x49, 0x44, 0x33, 0x04]), {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      }),
    );

    await generateTTS(
      {
        providerId: 'custom-tts-openrouter',
        modelId: 'S2.1 Pro Free',
        voice: 'voice-id',
        speed: 1,
        apiKey: 'test-key',
        baseUrl: 'https://openrouter.ai/api/v1/',
      },
      'Hello',
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/audio/speech');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: 'fish-audio/s2.1-pro-free:free',
      response_format: 'mp3',
    });
  });
});
