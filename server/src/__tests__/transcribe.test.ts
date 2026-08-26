import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/send-email', () => ({
    sendEmail: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

// Each test gets its own user id so the in-memory per-user rate limiter, which
// persists across tests with the router module, doesn't leak between them.
let currentUserId = 'user-1';
vi.mock('../middleware/auth', () => ({
    requireAuth: (req: any, _res: any, next: any) => {
        req.session = { user: { id: currentUserId } };
        next();
    }
}));

import request from 'supertest';
import app from '../server';

const AUDIO = Buffer.from('fake-opus-bytes');

function mockWhisper(response: Partial<Response> | Error) {
    const fetchMock = vi.fn();
    if (response instanceof Error) fetchMock.mockRejectedValue(response);
    else fetchMock.mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

const okWhisper = (text: string) => ({
    ok: true,
    status: 200,
    json: async () => ({ text })
}) as any;

beforeEach(() => {
    currentUserId = `user-${Math.random()}`;
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('POST /api/transcribe', () => {
    it('returns the transcription text from the whisper service', async () => {
        mockWhisper(okWhisper('  Bonjour le journal.  '));

        const response = await request(app)
            .post('/api/transcribe')
            .set('Content-Type', 'audio/webm')
            .send(AUDIO);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ text: 'Bonjour le journal.' });
    });

    it('forwards the audio to whisper as a transcribe task in the configured language', async () => {
        const fetchMock = mockWhisper(okWhisper('ok'));

        await request(app).post('/api/transcribe').set('Content-Type', 'audio/webm').send(AUDIO);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toContain('/asr?task=transcribe');
        expect(url).toContain('language=fr');
        expect(init.body).toBeInstanceOf(FormData);
        expect(init.body.get('audio_file')).toBeInstanceOf(Blob);
    });

    it('rejects an empty body', async () => {
        const fetchMock = mockWhisper(okWhisper('ok'));

        const response = await request(app)
            .post('/api/transcribe')
            .set('Content-Type', 'audio/webm')
            .send(Buffer.alloc(0));

        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns 502 when the whisper service errors', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockWhisper({ ok: false, status: 500 } as any);

        const response = await request(app)
            .post('/api/transcribe')
            .set('Content-Type', 'audio/webm')
            .send(AUDIO);

        expect(response.status).toBe(502);
    });

    it('returns 504 when the whisper service times out', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const timeout = new Error('timed out');
        timeout.name = 'TimeoutError';
        mockWhisper(timeout);

        const response = await request(app)
            .post('/api/transcribe')
            .set('Content-Type', 'audio/webm')
            .send(AUDIO);

        expect(response.status).toBe(504);
    });

    it('rate-limits a user hammering the CPU-bound endpoint', async () => {
        mockWhisper(okWhisper('ok'));

        const send = () => request(app)
            .post('/api/transcribe')
            .set('Content-Type', 'audio/webm')
            .send(AUDIO);

        for (let i = 0; i < 10; i++) {
            expect((await send()).status).toBe(200);
        }
        expect((await send()).status).toBe(429);
    });
});
