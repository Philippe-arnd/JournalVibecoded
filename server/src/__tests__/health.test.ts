import { describe, it, expect, vi } from 'vitest';

vi.mock('../utils/send-email', () => ({
    sendEmail: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

import request from 'supertest';
import app from '../server';

describe('Server Health', () => {
    it('should return OK for /health', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK');
    });

    it('should log auth requests', async () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
        await request(app).get('/api/auth/test');
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Auth Request: GET /test'), undefined);
        spy.mockRestore();
    });

    it('should return 404 for unknown routes', async () => {
        const response = await request(app).get('/api/unknown');
        expect(response.status).toBe(404);
    });
});
