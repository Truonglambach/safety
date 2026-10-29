const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const encoder = new TextEncoder();

function byteLength(value) {
  return encoder.encode(value).byteLength;
}

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map(String))];
}

function errorFields(error) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack ?? null };
  }
  return { message: String(error), stack: null };
}

/** A bounded, in-memory log for browser applications. No user input events are captured. */
export function createDebugLogger({
  appVersion = 'unknown',
  commitId = 'unknown',
  browserVersion = globalThis.navigator?.userAgent ?? 'unknown',
  maxBytes = DEFAULT_MAX_BYTES,
  debugEnabled = false,
  now = () => new Date().toISOString(),
} = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 256) {
    throw new RangeError('maxBytes must be an integer of at least 256');
  }

  const entries = [];
  let totalBytes = 0;
  let enabled = Boolean(debugEnabled);

  function append(entry) {
    // Keep even an oversized exception: trim its text until the record fits.
    const record = { ...entry };
    let serialized = JSON.stringify(record);
    while (byteLength(serialized) > maxBytes) {
      const field = record.stack ? 'stack' : record.message ? 'message' : null;
      if (!field) {
        record.componentIds = [];
        record.action = 'oversized-record';
        record.truncated = true;
        serialized = JSON.stringify(record);
        if (byteLength(serialized) > maxBytes) return false;
        break;
      }
      record[field] = record[field].slice(0, Math.floor(record[field].length / 2));
      record.truncated = true;
      serialized = JSON.stringify(record);
    }

    const size = byteLength(serialized);
    while (totalBytes + size > maxBytes) {
      totalBytes -= entries.shift().size;
    }
    entries.push({ value: record, size });
    totalBytes += size;
    return true;
  }

  function logAction(action, { componentIds = [] } = {}) {
    if (!enabled) return false;
    return append({
      timestamp: now(), level: 'debug', action: String(action),
      componentIds: normalizeIds(componentIds),
    });
  }

  function logError(action, error, { componentIds = [] } = {}) {
    return append({
      timestamp: now(), level: 'error', action: String(action),
      componentIds: normalizeIds(componentIds), ...errorFields(error),
    });
  }

  function runAction(action, callback, options = {}) {
    logAction(action, options);
    try {
      const result = callback();
      if (result && typeof result.then === 'function') {
        return Promise.resolve(result).catch((error) => {
          logError(action, error, options);
          throw error;
        });
      }
      return result;
    } catch (error) {
      logError(action, error, options);
      throw error;
    }
  }

  function getEntries() {
    return entries.map(({ value }) => structuredClone(value));
  }

  function exportJson({ projectState } = {}) {
    const payload = {
      formatVersion: 1,
      exportedAt: now(),
      appVersion: String(appVersion),
      commitId: String(commitId),
      browserVersion: String(browserVersion),
      debugEnabled: enabled,
      entries: getEntries(),
    };
    if (projectState !== undefined) payload.projectState = projectState;
    return JSON.stringify(payload, null, 2);
  }

  return {
    logAction, logError, runAction, getEntries, exportJson,
    get debugEnabled() { return enabled; },
    setDebugEnabled(value) { enabled = Boolean(value); },
    get byteLength() { return totalBytes; },
    get maxBytes() { return maxBytes; },
  };
}

/** Capture uncaught browser exceptions and rejected promises, including in normal mode. */
export function installGlobalErrorHandlers(logger, target = globalThis) {
  const onError = (event) => logger.logError('uncaught-exception', event.error ?? event.message);
  const onRejection = (event) => logger.logError('unhandled-rejection', event.reason);
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
}
