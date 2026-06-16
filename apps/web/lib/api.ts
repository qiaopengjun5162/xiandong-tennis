import type { OptionValue } from '@xiandong/core';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Submit a completed quiz result to the Axum backend.
 * Failures are swallowed intentionally so that a transient backend issue
 * never blocks the user from seeing their result.
 */
export async function submitResult(
  answers: OptionValue[],
  resultType: string
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, result_type: resultType }),
    });
  } catch {
    // Silent fail: don't block user experience.
  }
}
