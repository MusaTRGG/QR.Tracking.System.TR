import React, { useState } from 'react';
import { Scanner as QRScanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

export default function Scanner() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleScan = (text) => {
    if (text) {
      // Check if it's a URL leading to a device
      try {
        const url = new URL(text);
        if (url.pathname.includes('/device/')) {
          const deviceId = url.pathname.split('/').pop();
          navigate(`/device/${deviceId}`);
        } else {
            // Not our system QR
            setError('Bu QR kod sisteme ait değil.');
        }
      } catch (e) {
        // Not a URL, maybe just raw device ID
        if(text.startsWith('PLC-') || text.startsWith('LAB-') || text.startsWith('OSC-') || text.startsWith('CEN-')) {
            navigate(`/device/${text}`);
        } else {
            setError('Geçersiz QR kod formatı.');
        }
      }
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-lg">
      <div className="flex flex-col gap-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-3xl">qr_code_scanner</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Cihaz Tarayıcı</h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Cihaz üzerindeki QR kodu kameraya okutarak doğrudan cihaz sayfasına erişebilirsiniz.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm overflow-hidden flex flex-col items-center">
        {error && (
            <div className="w-full mb-md p-sm bg-error-container text-error rounded-lg font-body-sm text-center flex items-center justify-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
            </div>
        )}
        
        <div className="w-full max-w-[400px] aspect-square rounded-lg overflow-hidden border-2 border-primary-fixed-dim bg-black relative shadow-inner">
            <QRScanner 
                onResult={(text, result) => handleScan(text)} 
                onError={(err) => setError(err?.message || 'Kamera erişim hatası')}
                options={{
                    delayBetweenScanSuccess: 2000,
                    delayBetweenScanAttempts: 200,
                }}
            />
            {/* Scanner frame overlay */}
            <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                <div className="w-full h-full border-2 border-dashed border-primary"></div>
            </div>
        </div>

        <div className="mt-lg text-center max-w-[400px]">
            <p className="font-body-sm text-on-surface-variant">Kamera erişimine izin vermeniz gerekmektedir. QR kodu tarama alanına yerleştirin.</p>
        </div>
      </div>
    </div>
  );
}
