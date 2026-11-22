const CODE_MESSAGES = {
  NO_TOKEN: 'Please sign in again.',
  INVALID_TOKEN: 'Please sign in again.',
  INVALID_CREDENTIALS: 'Email or password is wrong.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  USER_NOT_FOUND: 'We couldn’t find that account.',
  INSUFFICIENT_BALANCE: 'Not enough money in this account.',
  BANK_NOT_FOUND: 'That bank account was not found.',
  BANK_IN_USE: 'You can’t delete this bank while it still has transactions or bills.',
  TRANSACTION_NOT_FOUND: 'That transaction was not found.',
  VALIDATION_ERROR: 'Please check the form and try again.',
  RATE_LIMIT: 'You’re doing that too quickly. Please wait a moment and try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
  SESSION_EXPIRED: 'Your session expired. Please sign in again.',
  BAD_REQUEST: 'That request doesn’t look right. Please try again.',
  NOT_FOUND: 'We couldn’t find what you asked for.',
  FORBIDDEN: 'You don’t have permission to do that.',
  EMAIL_FAILED: 'We couldn’t send the email. Please try again later.',
  PASSWORD_INCORRECT: 'Current password is incorrect.',
  TELEGRAM_CODE_INVALID: 'That linking code is invalid or has expired.',
  TELEGRAM_CODE_REQUIRED: 'A linking code is required.',
  AI_UNAUTHORIZED: 'Please sign in again.',
  AI_FORBIDDEN: 'You can’t do that with this account.',
  AI_RATE_LIMIT: 'You’re sending messages too quickly. Please wait a moment.',
  AI_LLM_QUOTA: 'The AI service is out of quota. Update your API key in Settings.',
  AI_LLM_UNAVAILABLE: 'The AI is temporarily unavailable. Please try again.',
  AI_BACKEND_ERROR: 'We couldn’t update your money data right now. Please try again.',
  AI_TOOL_FAILED: 'We couldn’t complete that action. Please try again.',
  AI_INTERNAL: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'We couldn’t reach the server. Check your internet and try again.',
};

const TECHNICAL_PATTERNS =
  /network error|timeout|econnrefused|axios|failed to fetch|jwt|mongoose|stack|traceback|langgraph|internal server/i;

/**
 * Plain message for toasts / chat bubbles.
 */
export function getUserMessage(error) {
  if (!error) return CODE_MESSAGES.INTERNAL_ERROR;
  if (typeof error === 'string') {
    if (CODE_MESSAGES[error]) return CODE_MESSAGES[error];
    if (TECHNICAL_PATTERNS.test(error)) return CODE_MESSAGES.INTERNAL_ERROR;
    return error;
  }

  const data = error.response?.data || error.data || {};
  const code =
    error.errorCode ||
    data.code ||
    data.error?.code ||
    (typeof data.detail === 'object' ? data.detail?.code : undefined);

  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code];

  const raw =
    data.message ||
    (typeof data.detail === 'string' ? data.detail : data.detail?.message) ||
    error.errorMessage ||
    error.message;

  if (!raw || TECHNICAL_PATTERNS.test(String(raw))) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return CODE_MESSAGES.NETWORK_ERROR;
    }
    return CODE_MESSAGES.INTERNAL_ERROR;
  }

  return String(raw);
}

/**
 * Developer-oriented console log (never shown to end users as-is).
 */
export function logClientError(error, context = 'api') {
  const data = error?.response?.data || error?.data || {};
  const payload = {
    context,
    requestId:
      error?.requestId ||
      data.requestId ||
      error?.response?.headers?.['x-request-id'] ||
      error?.response?.headers?.['X-Request-Id'],
    code: error?.errorCode || data.code || data.error?.code,
    status: error?.response?.status || error?.status,
    url: error?.config?.url || error?.url,
    method: error?.config?.method,
    userMessage: getUserMessage(error),
    raw: data.detail || data.message || error?.message,
  };
  // eslint-disable-next-line no-console
  console.error('[MoneyMatrix]', payload);
}

export { CODE_MESSAGES };
