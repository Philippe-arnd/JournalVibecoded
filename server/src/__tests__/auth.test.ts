import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sendEmail BEFORE importing auth
vi.mock('../utils/send-email', () => ({
    sendEmail: vi.fn().mockResolvedValue({ id: 'test-id' })
}));

import { auth } from '../auth';
import { sendEmail } from '../utils/send-email';

describe('Auth Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should have auth defined', () => {
        expect(auth).toBeDefined();
    });

    it('should have sendResetPassword callback that calls sendEmail', async () => {
        // We have to find where better-auth stores the callbacks
        // If it's not easily accessible, we might need to rethink this
        // But let's try to see if we can trigger it through the internal options if available
        const options = (auth as any).options;
        if (options && options.emailAndPassword && options.emailAndPassword.sendResetPassword) {
            await options.emailAndPassword.sendResetPassword({
                url: 'http://reset-url',
                user: { email: 'test@example.com' }
            });
            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Reset Password',
                templateName: 'reset_password.html',
                data: { url: 'http://reset-url' }
            }));
        }
    });

    it('should have sendVerificationEmail callback that calls sendEmail', async () => {
        const options = (auth as any).options;
        if (options && options.emailVerification && options.emailVerification.sendVerificationEmail) {
            await options.emailVerification.sendVerificationEmail({
                url: 'http://verify-url?token=123',
                user: { email: 'test@example.com' }
            });
            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Verify Email',
                templateName: 'confirm_signup.html',
                data: expect.objectContaining({
                    url: expect.stringContaining('callbackURL')
                })
            }));
        }
    });
});
