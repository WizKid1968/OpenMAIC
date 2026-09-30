import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  configured: vi.fn(() => false),
  findUserSkill: vi.fn(),
}));
vi.mock('@/lib/config/feature-flags', () => ({ isAgentRuntimeConfigured: mocks.configured }));
vi.mock('@/lib/server/agent-runtime/user-skills', () => ({ findUserSkill: mocks.findUserSkill }));

import { GET } from '@/app/api/skills/[id]/route';

const download = (id: string) =>
  GET(new NextRequest(`http://localhost/api/skills/${id}`), { params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured.mockReturnValue(false);
});

describe('skill downloads without the optional agent runtime', () => {
  it.each(['openmaic', 'lecture-style'])('downloads the bundled %s zip', async (id) => {
    const response = await download(id);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/zip');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
    expect(mocks.findUserSkill).not.toHaveBeenCalled();
  });

  it('does not access owner storage for an unknown or user skill', async () => {
    expect((await download('usk_unknown')).status).toBe(404);
    expect(mocks.findUserSkill).not.toHaveBeenCalled();
  });
});
