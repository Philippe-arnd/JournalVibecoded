import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server';
import { auth } from '../auth';
import { withRLS } from '../db';

// Mock auth
vi.mock('../auth', () => ({
    auth: {
        api: {
            getSession: vi.fn()
        }
    }
}));

// Mock db
vi.mock('../db', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../db')>();
    return {
        ...actual,
        withRLS: vi.fn()
    };
});

describe('Entries Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    it('GET /api/entries should return 401 if unauthorized', async () => {
        (auth.api.getSession as any).mockResolvedValue(null);

        const response = await request(app).get('/api/entries');
        expect(response.status).toBe(401);
    });

    it('GET /api/entries should return user entries when authorized', async () => {
        (auth.api.getSession as any).mockResolvedValue(mockSession);

        const mockEntries = [
            { id: '1', userId: 'user-1', entryDate: '2026-01-01', professionalRecap: 'Work' }
        ];

        (withRLS as any).mockImplementation(async (userId, cb) => {
            const mockTx = {
                query: {
                    entries: {
                        findMany: vi.fn().mockResolvedValue(mockEntries)
                    }
                }
            };
            return await cb(mockTx);
        });

        const response = await request(app).get('/api/entries');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEntries);
        expect(withRLS).toHaveBeenCalledWith('user-1', expect.any(Function));
    });

    it('GET /api/entries/today should return today\'s entry', async () => {
        (auth.api.getSession as any).mockResolvedValue(mockSession);

        const mockEntry = { id: '1', userId: 'user-1', entryDate: new Date().toISOString().split('T')[0] };

        (withRLS as any).mockImplementation(async (userId, cb) => {
            const mockTx = {
                query: {
                    entries: {
                        findFirst: vi.fn().mockResolvedValue(mockEntry)
                    }
                }
            };
            return await cb(mockTx);
        });

        const response = await request(app).get('/api/entries/today');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEntry);
    });

    it('POST /api/entries should create or update an entry', async () => {
        (auth.api.getSession as any).mockResolvedValue(mockSession);

        const entryData = { professional_recap: 'New work' };
        const savedEntry = { id: '1', ...entryData, userId: 'user-1' };

        (withRLS as any).mockImplementation(async (userId, cb) => {
            const mockTx = {
                query: {
                    entries: {
                        findFirst: vi.fn().mockResolvedValue(null) // Mock as new entry
                    }
                },
                insert: vi.fn().mockReturnThis(),
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([savedEntry])
            };
            return await cb(mockTx);
        });

        const response = await request(app)
            .post('/api/entries')
            .send(entryData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(savedEntry);
    });

    it('DELETE /api/entries/:id should delete an entry', async () => {
        (auth.api.getSession as any).mockResolvedValue(mockSession);

        (withRLS as any).mockImplementation(async (userId, cb) => {
            const mockTx = {
                delete: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue({ success: true })
            };
            return await cb(mockTx);
        });

        const response = await request(app).delete('/api/entries/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
    });

    it('should handle errors and return 500', async () => {
        (auth.api.getSession as any).mockResolvedValue(mockSession);
        (withRLS as any).mockRejectedValue(new Error('DB Error'));

        const response = await request(app).get('/api/entries');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to fetch entries' });
    });
});
