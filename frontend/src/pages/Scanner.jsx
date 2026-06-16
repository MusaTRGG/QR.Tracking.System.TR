import React, { useState } from 'react';
import { Scanner as QRScanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';

export default function Scanner() {
  const [error, setError] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const navigate = useNavigate();

  const handleScan = (text) => {
    if (text) {
      // Check if it's a URL leading to a book or legacy device
      try {
        const url = new URL(text);
        if (url.pathname.includes('/book/') || url.pathname.includes('/device/')) {
          const bookId = url.pathname.split('/').pop();
          navigate(`/book/${bookId}`);
        } else {
            // Not our system QR
            setError('Bu QR kod sisteme ait değil.');
        }
      } catch (e) {
        // Not a URL, navigate directly as book ID
        navigate(`/book/${text}`);
      }
    }
  };

  const startScanner = () => {
    setError(null);
    setIsScannerActive(true);
  };

  const stopScanner = () => {
    setIsScannerActive(false);
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
        
        <div className="w-full max-w-[400px] aspect-square rounded-lg overflow-hidden border-2 border-primary-fixed-dim bg-black relative shadow-inner flex flex-col items-center justify-center">
            {isScannerActive ? (
              <>
                <QRScanner 
                    onScan={(detectedCodes) => {
                      if (detectedCodes && detectedCodes.length > 0) {
                        handleScan(detectedCodes[0].rawValue);
                      }
                    }}
                    onResult={(text, result) => {
                      if (text) handleScan(text);
                    }}
                    onError={(err) => setError(err?.message || 'Kamera erişim hatası. Tarayıcının HTTPS üzerinden çalıştığından emin olun.')}
                    options={{
                        delayBetweenScanSuccess: 2000,
                        delayBetweenScanAttempts: 200,
                    }}
                />
                {/* Scanner frame overlay */}
                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                    <div className="w-full h-full border-2 border-dashed border-primary"></div>
                </div>
              </>
            ) : (
              <div className="text-center p-md flex flex-col items-center gap-md">
                <span className="material-symbols-outlined text-5xl text-outline-variant animate-pulse">photo_camera</span>
                <p className="text-outline-variant font-label-md text-label-md">Kamera Başlatılmaya Hazır</p>
                <button 
                  onClick={startScanner} 
                  className="bg-primary text-on-primary hover:opacity-90 px-lg py-sm rounded-lg font-label-md text-label-md transition-colors flex items-center gap-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined">videocam</span>
                  Kamerayı Başlat
                </button>
              </div>
            )}
        </div>

        <div className="mt-lg text-center max-w-[400px] space-y-sm">
            {isScannerActive && (
              <button 
                onClick={stopScanner} 
                className="border border-error text-error hover:bg-error-container/20 px-md py-sm rounded-lg font-label-md text-label-md transition-colors flex items-center gap-xs mx-auto cursor-pointer"
              >
                <span className="material-symbols-outlined">videocam_off</span>
                Kamerayı Kapat
              </button>
            )}
            <p className="font-body-sm text-on-surface-variant">
              Kamera erişimi için tarayıcınızın **HTTPS (güvenli bağlantı)** üzerinden çalıştığından emin olun. Google Chrome ve Safari gibi tarayıcılar HTTP protokolünde kamera izinlerini güvenlik nedeniyle engellemektedir. (Vercel linkiniz HTTPS olduğu için kamerayı sorunsuz açacaktır.)
            </p>
        </div>
      </div>
    </div>
  );
}
