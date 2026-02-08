import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('Server Health', () => {
    it('should return OK for /health', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK');
    });

    it('should return 404 for unknown routes', async () => {
        const response = await request(app).get('/api/unknown');
        expect(response.status).toBe(404);
    });
});
