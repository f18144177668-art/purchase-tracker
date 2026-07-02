import { isNativeApp } from './platform';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  details?: string;
}

const STORAGE_KEY = 'purchase_tracker_logs';
const MAX_LOGS = 500;
const PROXY_BASE = import.meta.env.VITE_PROXY_BASE_URL || '';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // 存储已满时忽略
  }
}

function formatDetails(details: unknown): string {
  if (details instanceof Error) {
    return `${details.name}: ${details.message}\n${details.stack || ''}`;
  }
  try {
    return JSON.stringify(details, Object.getOwnPropertyNames(details), 2);
  } catch {
    return String(details);
  }
}

async function uploadLog(level: LogLevel, message: string, details?: string) {
  if (!PROXY_BASE) return;
  if (!isNativeApp()) return;

  try {
    await fetch(`${PROXY_BASE}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, details }),
    });
  } catch {
    // 上传失败不阻塞本地日志
  }
}

function addLog(level: LogLevel, message: string, details?: unknown) {
  const logs = readLogs();
  const detailText = details !== undefined ? formatDetails(details) : undefined;
  const entry: LogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    level,
    message,
    details: detailText,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.splice(0, logs.length - MAX_LOGS);
  }
  writeLogs(logs);

  // 异步上传到云端，失败不影响本地记录
  uploadLog(level, message, detailText);

  // 同时输出到控制台，方便开发调试
  const consoleArgs = details !== undefined ? [message, details] : [message];
  if (level === 'error') {
    console.error(...consoleArgs);
  } else if (level === 'warn') {
    console.warn(...consoleArgs);
  } else if (level === 'info') {
    console.info(...consoleArgs);
  } else {
    console.log(...consoleArgs);
  }
}

export const logger = {
  debug: (message: string, details?: unknown) => addLog('debug', message, details),
  info: (message: string, details?: unknown) => addLog('info', message, details),
  warn: (message: string, details?: unknown) => addLog('warn', message, details),
  error: (message: string, details?: unknown) => addLog('error', message, details),
};

export function getLogs(): LogEntry[] {
  return readLogs();
}

export function clearLogs() {
  writeLogs([]);
}

export function exportLogsText(): string {
  const logs = readLogs();
  return logs
    .map((log) => {
      const time = new Date(log.timestamp).toLocaleString('zh-CN');
      const detail = log.details ? `\n${log.details}` : '';
      return `[${time}] [${log.level.toUpperCase()}] ${log.message}${detail}`;
    })
    .join('\n\n');
}
