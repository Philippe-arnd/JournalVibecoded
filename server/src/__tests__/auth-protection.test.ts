import { describe, it, expect, vi } from 'vitest';

vi.mock('../utils/send-email', () => ({
    sendEmail: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

import request from 'supertest';
import app from '../server';

describe('Auth Protection', () => {
    it('should return 401 Unauthorized for /api/entries without a session', async () => {
        const response = await request(app).get('/api/entries');
        // Better Auth or our middleware should catch this
        // Based on routes/entries.ts, it uses requireAuth
        expect(response.status).toBe(401);
    });

    it('should return 401 Unauthorized for /api/entries/today without a session', async () => {
        const response = await request(app).get('/api/entries/today');
        expect(response.status).toBe(401);
    });

    // The whisper container has no auth of its own and is CPU-bound, so this route
    // is the only thing standing between it and an unauthenticated caller.
    it('should return 401 Unauthorized for /api/transcribe without a session', async () => {
        const response = await request(app)
            .post('/api/transcribe')
            .set('Content-Type', 'audio/webm')
            .send(Buffer.from('audio'));
        expect(response.status).toBe(401);
    });
});
