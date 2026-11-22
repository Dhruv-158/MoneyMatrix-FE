import { getUserMessage, logClientError } from '@/utils/errors';
import { refreshAccessToken } from '@/services/api';

const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

/**
 * Call AI-MoneyMatrix chat endpoint with the user's JWT.
 */
export async function chatWithAssistant(token, message) {
  let accessToken = token || localStorage.getItem('token');
  if (!accessToken) {
    const err = new Error('Please sign in again.');
    err.errorCode = 'AI_UNAUTHORIZED';
    err.errorMessage = getUserMessage(err);
    logClientError(err, 'ai-chat');
    throw err;
  }

  const doFetch = (bearer) =>
    fetch(`${AI_BASE_URL.replace(/\/$/, '')}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ message }),
    });

  let res;
  try {
    res = await doFetch(accessToken);
    if (res.status === 401) {
      accessToken = await refreshAccessToken();
      res = await doFetch(accessToken);
    }
  } catch (networkErr) {
    networkErr.errorCode = 'NETWORK_ERROR';
    networkErr.errorMessage = getUserMessage(networkErr);
    logClientError(networkErr, 'ai-chat');
    throw networkErr;
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : data?.message || `AI service error (${res.status})`
    );
    err.status = res.status;
    err.data = data;
    err.errorCode = data?.code || (res.status === 401 ? 'AI_UNAUTHORIZED' : 'AI_INTERNAL');
    err.requestId = data?.requestId || res.headers.get('X-Request-Id');
    err.errorMessage = getUserMessage(err);
    logClientError(err, 'ai-chat');
    throw err;
  }

  return data?.response || data?.message || 'No response from assistant.';
}

/**
 * Ping the configured LLM via AI service.
 */
export async function testLlmConnection(token) {
  let accessToken = token || localStorage.getItem('token');
  if (!accessToken) {
    const err = new Error('Please sign in again.');
    err.errorCode = 'AI_UNAUTHORIZED';
    err.errorMessage = getUserMessage(err);
    throw err;
  }

  const doFetch = (bearer) =>
    fetch(`${AI_BASE_URL.replace(/\/$/, '')}/api/v1/llm/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({}),
    });

  let res = await doFetch(accessToken);
  if (res.status === 401) {
    accessToken = await refreshAccessToken();
    res = await doFetch(accessToken);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(
      typeof data?.detail === 'string' ? data.detail : data?.message || 'LLM test failed'
    );
    err.status = res.status;
    err.errorCode = data?.code || 'AI_LLM_CONFIG';
    err.requestId = data?.requestId;
    err.errorMessage = getUserMessage(err);
    logClientError(err, 'ai-llm-test');
    throw err;
  }

  return data;
}
