import { useState, useEffect } from 'react';
import { X, RefreshCw, Shield, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { getCaptcha, verifyAntiCounterfeit } from '@/utils/antiCounterfeit';

interface AntiCounterfeitModalProps {
  antiCounterfeitCode: string;
  onClose: () => void;
}

interface CaptchaData {
  sessionId: string;
  captchaImage: string;
}

interface VerifyData {
  isGenuine: boolean;
  status: number;
  message: string;
}

export default function AntiCounterfeitModal({
  antiCounterfeitCode,
  onClose,
}: AntiCounterfeitModalProps) {
  const [code, setCode] = useState(antiCounterfeitCode);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [vcode, setVcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<VerifyData | null>(null);
  const [error, setError] = useState('');

  const loadCaptcha = async () => {
    setRefreshing(true);
    setError('');
    setResult(null);
    try {
      const data = await getCaptcha();
      setCaptcha(data);
    } catch (err: any) {
      setError(err.message || '获取验证码失败');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleVerify = async () => {
    if (!captcha || !vcode.trim()) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const cleanCode = code.replace(/\s/g, '').toUpperCase();
      const data = await verifyAntiCounterfeit(
        cleanCode,
        vcode.trim(),
        captcha.sessionId
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || '查询失败');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            防伪查询
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              防伪码
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
              placeholder="请输入防伪码"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono"
            />
          </div>

          {result ? (
            <div
              className={`rounded-xl p-6 text-center ${
                result.isGenuine
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.isGenuine ? (
                <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-3" />
              ) : (
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-3" />
              )}
              <div
                className={`text-xl font-bold mb-2 ${
                  result.isGenuine ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.isGenuine ? '正品' : '查询失败'}
              </div>
              <p
                className={`text-sm ${
                  result.isGenuine ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {result.message}
              </p>
              <button
                onClick={loadCaptcha}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                重新查询
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex flex-col gap-3">
                  <div
                    className="relative h-[50px] w-[140px] cursor-pointer bg-gray-50 mx-auto"
                    onClick={!refreshing ? loadCaptcha : undefined}
                  >
                    {captcha ? (
                      <img
                        src={captcha.captchaImage}
                        alt="验证码"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    )}
                    {refreshing && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={vcode}
                    onChange={(e) => setVcode(e.target.value)}
                    placeholder="请输入验证码"
                    maxLength={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm text-center tracking-widest"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerify();
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1.5 text-center">
                  点击图片刷新验证码
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || !vcode.trim()}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    查询中...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    立即查询
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
