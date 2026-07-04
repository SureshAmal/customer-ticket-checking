import { apiEndpoint } from './constants.js';

export class ApiError extends Error {
  constructor(message, { status, retryable = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryable = retryable;
  }
}

function responseError(data, fallback) {
  const detail = data?.detail;

  if (typeof detail === 'string') return detail;
  if (detail?.retryable && detail?.message) return detail.message;
  if (detail?.error?.includes('high demand')) {
    return 'The model is temporarily busy. Please try again in a minute.';
  }
  if (detail?.message) return detail.message;
  if (detail) return JSON.stringify(detail);
  return fallback;
}

export async function classifyMessages(messages) {
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(responseError(data, response.statusText), {
      status: response.status,
      retryable: Boolean(data?.detail?.retryable) || response.status === 429 || response.status === 503,
    });
  }

  return data;
}
