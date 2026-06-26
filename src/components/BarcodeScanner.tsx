import { useEffect, useRef, useState } from 'react';
import { X, Camera, Flashlight } from 'lucide-react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = null;

    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        codeReader = new BrowserMultiFormatReader();
        
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        controlsRef.current = await codeReader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result) => {
            if (result) {
              const code = result.getText();
              if (code) {
                onScan(code);
              }
            }
          }
        );

        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
          setHasTorch(!!capabilities.torch);
        }
      } catch (err) {
        console.error('Scanner error:', err);
        setError('无法启动摄像头，请确保已授权摄像头权限');
      }
    };

    startScanner();

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [onScan]);

  const toggleTorch = async () => {
    if (!videoRef.current) return;
    const stream = videoRef.current.srcObject as MediaStream;
    if (!stream) return;
    
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error('Torch error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-medium">扫描快递单号</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-64 h-32 border-2 border-white/60 rounded-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br" />
            </div>
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500/80 animate-pulse" />
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center text-white/80 text-sm">
          将条码放入框内即可自动扫描
        </div>
      </div>

      <div className="flex justify-center gap-4 p-4 bg-black/50">
        {hasTorch && (
          <button
            onClick={toggleTorch}
            className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
              torchOn ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white'
            }`}
          >
            <Flashlight size={24} />
            <span className="text-xs">{torchOn ? '关灯' : '开灯'}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
          <div className="text-center text-white">
            <Camera size={48} className="mx-auto mb-4 text-red-400" />
            <p className="mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
