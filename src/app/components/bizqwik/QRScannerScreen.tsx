import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

interface QRScannerScreenProps {
  onClose: () => void;
  onScanSuccess: (qrCode: string) => void;
}

export function QRScannerScreen({ onClose, onScanSuccess }: QRScannerScreenProps) {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const qrCodeRegionId = "qr-reader";
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(qrCodeRegionId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (!hasScannedRef.current) {
              hasScannedRef.current = true;
              setScanning(false);
              
              // Stop scanner
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              });
            }
          },
          (errorMessage) => {
            // Ignore error messages during scanning
          }
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError("Unable to access camera. Please check permissions.");
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error("Error stopping scanner:", err);
        });
      }
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        onClose();
      }).catch(() => {
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white">Scan QR Code</h2>
            <p className="text-sm text-white/70 mt-1">
              Position the QR code within the frame
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-95 transition-transform duration-[var(--transition-base)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          {/* QR Scanner */}
          <div 
            id="qr-reader" 
            className="rounded-3xl overflow-hidden"
            style={{ width: "100%", maxWidth: "400px" }}
          />

          {/* Scanning Frame Overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64">
                {/* Corner Borders */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[var(--bq-primary)] rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[var(--bq-primary)] rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[var(--bq-primary)] rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[var(--bq-primary)] rounded-br-3xl" />
                
                {/* Scanning Line Animation */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--bq-primary)] to-transparent"
                  animate={{
                    top: ["0%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <div className="bg-red-500 text-white p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Camera Access Required</p>
                <p className="text-sm text-white/90">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {scanning && !error && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full mb-3">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
            <p className="text-sm text-white/80">
              Hold your phone steady and align the QR code
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
