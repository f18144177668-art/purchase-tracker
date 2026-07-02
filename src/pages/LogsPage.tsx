import { useState } from 'react';
import { ArrowLeft, Trash2, Copy, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLogs, clearLogs, exportLogsText } from '@/utils/logger';

export function LogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState(getLogs());
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    if (window.confirm('确定清空所有日志吗？')) {
      clearLogs();
      setLogs([]);
    }
  };

  const handleCopy = async () => {
    const text = exportLogsText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 复制失败时弹出文本供手动复制
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<pre>${text}</pre>`);
      }
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-danger-600 bg-danger-50';
      case 'warn':
        return 'text-warning-600 bg-warning-50';
      case 'info':
        return 'text-primary-600 bg-primary-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="page-container flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">运行日志</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg active:bg-primary-100 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-danger-600 bg-danger-50 rounded-lg active:bg-danger-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-10 text-center flex-1">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">暂无日志</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className="card p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${getLevelColor(
                    log.level
                  )}`}
                >
                  {log.level}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
              <p className="text-sm text-gray-800 break-words">{log.message}</p>
              {log.details && (
                <pre className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                  {log.details}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
