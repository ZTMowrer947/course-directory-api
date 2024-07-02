import { toWebHandler } from 'h3';
import { describe, expect,test } from 'vitest';

import app from '~/app';

describe('Integration API tests', () => {
  test('API is accessible', async () => {
    const handler = toWebHandler(app);

    const url = new URL('/', 'http://localhost:5000');

    const res = await handler(new Request(url));

    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });
});
