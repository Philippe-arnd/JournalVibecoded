import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock pg module before anything else
vi.mock('pg', () => {
  class MockPool {
    connect = vi.fn();
    on = vi.fn();
    end = vi.fn();
    query = vi.fn();
  }
  return { default: { Pool: MockPool }, Pool: MockPool };
});

import { withRLS, db } from '../db';
import { sql } from 'drizzle-orm';

// Now mock the db object itself since it was already created at import time
vi.spyOn(db, 'transaction').mockImplementation(async (cb: any) => {
  const mockTx = {
    execute: vi.fn().mockResolvedValue({}),
    query: {
        entries: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        }
    }
  };
  return await cb(mockTx);
});

describe('RLS Helper Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set app.current_user_id in a transaction', async () => {
    const mockUserId = 'user-123';
    const mockTx = {
      execute: vi.fn().mockResolvedValue({}),
    };
    
    vi.spyOn(db, 'transaction').mockImplementationOnce(async (cb: any) => {
      return await cb(mockTx);
    });

    const mockCallback = vi.fn().mockResolvedValue('success');

    const result = await withRLS(mockUserId, mockCallback);

    // Verify set_config was called to set app.current_user_id
    // Drizzle sql tags produce an object with a queryChunk or similar depending on version
    // We just check if execute was called at all with the expected SQL
    expect(mockTx.execute).toHaveBeenCalled();
    const callArgs = (mockTx.execute as any).mock.calls[0][0];
    // Check if the SQL contains our set_config call
    const callArgsStr = JSON.stringify(callArgs);
    expect(callArgsStr).toContain('set_config');
    expect(callArgsStr).toContain('app.current_user_id');
    
    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith(mockTx);
    expect(result).toBe('success');
  });

  it('should propagate errors from the callback', async () => {
    const mockTx = {
      execute: vi.fn().mockResolvedValue({}),
    };
    vi.spyOn(db, 'transaction').mockImplementationOnce(async (cb: any) => {
      return await cb(mockTx);
    });

    const error = new Error('DB Error');
    const mockCallback = vi.fn().mockRejectedValue(error);

    await expect(withRLS('uid', mockCallback)).rejects.toThrow('DB Error');
  });
});
