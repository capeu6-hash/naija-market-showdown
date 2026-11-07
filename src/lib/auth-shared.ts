export const MAX_LOGIN_FAILURES = 5;
export const LOGIN_LOCK_MINUTES = 15;

export function loginLockAfterFailure(previousFailures: number, now = new Date()) {
  const failures = previousFailures + 1;
  const locked = failures >= MAX_LOGIN_FAILURES;
  return {
    failures,
    lockedUntil: locked ? new Date(now.getTime() + LOGIN_LOCK_MINUTES * 60_000) : null,
  };
}

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}
