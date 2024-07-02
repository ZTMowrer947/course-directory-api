import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getAppHandler, prismaMock } from './utils.ts';

describe('Integration API tests', () => {
  beforeEach(() => {
    // Mock Prisma Client to point to test database
    vi.doMock(`~/prisma-client.ts`, prismaMock);
  });

  // Clear mock
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('GET /api/courses retrieves course listing', async () => {
    // Setup web handler
    const handler = await getAppHandler();

    // Query for course list
    const url = new URL('/api/courses', 'http://localhost:5000');

    const res = await handler(new Request(url));

    // Expect a successful JSON response with the correct course listing
    expect(res.ok).toBe(true);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    await expect(res.json()).resolves.toStrictEqual([]);
  });
});
