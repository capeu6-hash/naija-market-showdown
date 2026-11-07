import { describe, expect, it } from "vitest";
import { loginLockAfterFailure, MAX_LOGIN_FAILURES, LOGIN_LOCK_MINUTES, formatPhoneForWhatsApp } from "@/lib/auth-shared";

describe("account security", () => {
  it("locks the fifth failed login for 15 minutes", () => {
    const now = new Date("2026-11-07T12:00:00Z");
    const result = loginLockAfterFailure(MAX_LOGIN_FAILURES - 1, now);
    expect(result.failures).toBe(5);
    expect(result.lockedUntil?.toISOString()).toBe("2026-11-07T12:15:00.000Z");
    expect(LOGIN_LOCK_MINUTES).toBe(15);
  });

  it("does not lock the fourth failed login", () => {
    expect(loginLockAfterFailure(3).lockedUntil).toBeNull();
  });

  it("converts a Nigerian local number for WhatsApp", () => {
    expect(formatPhoneForWhatsApp("08089778840")).toBe("2348089778840");
  });
});
