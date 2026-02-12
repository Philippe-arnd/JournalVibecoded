import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

const { mockResendSend } = vi.hoisted(() => ({
    mockResendSend: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

vi.mock('resend', () => {
    const MockResend = vi.fn().mockImplementation(function (this: any) {
        this.emails = {
            send: mockResendSend
        };
    });
    return { Resend: MockResend };
});

vi.mock('fs', () => ({
    default: {
        readFileSync: vi.fn(),
    },
    readFileSync: vi.fn(),
}));

import { sendEmail } from '../utils/send-email';

describe('sendEmail utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResendSend.mockResolvedValue({ id: 'test-id' });
    });

    it('should read template and send email with replacements', async () => {
        const mockTemplate = 'Hello {{name}}, click here: {{url}}';
        (fs.readFileSync as any).mockReturnValue(mockTemplate);

        await sendEmail({
            to: 'user@example.com',
            subject: 'Test Subject',
            templateName: 'test.html',
            data: { name: 'Alice', url: 'http://example.com' }
        });

        expect(fs.readFileSync).toHaveBeenCalled();
        expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@example.com',
            subject: 'Test Subject',
            html: 'Hello Alice, click here: http://example.com'
        }));
    });

    it('should throw error if email sending fails', async () => {
        (fs.readFileSync as any).mockReturnValue('Template');
        mockResendSend.mockRejectedValue(new Error('Resend Error'));

        await expect(sendEmail({
            to: 'fail@example.com',
            subject: 'Fail',
            templateName: 'test.html',
            data: {}
        })).rejects.toThrow('Resend Error');
    });
});
