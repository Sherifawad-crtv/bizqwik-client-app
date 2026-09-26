import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle, RotateCcw } from "lucide-react";
import { startQrCamera } from "../../../lib/qrCamera";
import { toast } from "sonner";

interface QRScannerScreenProps {
  onClose: () => void;
  onScanSuccess: (qrCode: string) => void;
}

const REGION_ID = "qr-reader";

// getUserMedia error -> a message a member can actually act on. iOS Safari
// (the platform most of our members are on) reports permission denial as
// NotAllowedError whether it was an explicit tap-"Don't Allow" or a
// previously-saved site setting, so both get the Settings pointer.
function friendlyCameraError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : (err as { name?: string } | undefined)?.name;
  if (!window.isSecureContext || name === "NotSupportedError") {
    return "Camera access needs a secure (https) connection. Open this gym's app link directly rather than a plain http address.";
  }
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera access is blocked for this app. On iPhone: tap \"AA\" in the address bar → Website Settings → Camera → Allow (or Settings app → Safari → Camera → Allow), then try again.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera was found on this device.";
    case "NotReadableError":
    case "TrackStartError":
      return "The camera is in use by another app. Close other camera apps (or tabs) and try again.";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "Couldn't access the back camera on this device.";
    default:
      return "Couldn't access the camera. Check that this app has camera permission and try again.";
  }
}

export function QRScannerScreen({ onClose, onScanSuccess }: QRScannerScreenProps) {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0); // bump to retry after an error
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    setScanning(true);
    const video = videoRef.current;
    if (!video) return;
    startQrCamera(video, (text) => {
      if (!alive) return;
      setScanning(false);
      onScanSuccess(text);
    })
      .then((stop) => {
        if (alive) stopRef.current = stop;
        else stop();
      })
      .catch((err) => {
        if (!alive) return;
        console.error("Error starting QR scanner:", err);
        setError(friendlyCameraError(err));
        setScanning(false);
      });
    return () => {
      alive = false;
      stopRef.current?.();
      stopRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleClose = () => {
    stopRef.current?.();
    stopRef.current = null;
    onClose();
  };

  const retry = () => {
    setError(null);
    setAttempt((n) => n + 1);
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
            aria-label="Close scanner"
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-95 transition-transform duration-[var(--transition-base)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[400px]">
          {/* QR Scanner — position:relative + a reserved aspect-square box so
              the injected <video> has somewhere to render (and our overlay
              lines up) before/while the camera stream attaches. */}
          <div id={REGION_ID} className="relative w-full aspect-square rounded-3xl overflow-hidden bg-neutral-900">
            <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Scanning Frame Overlay (purely decorative — the library scans
              the full frame, not just this box) */}
          {scanning && !error && (
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
            <div className="bg-red-500 text-white p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Camera unavailable</p>
                  <p className="text-sm text-white/90">{error}</p>
                </div>
              </div>
              <button
                onClick={retry}
                className="h-11 rounded-xl bg-white/15 flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform"
              >
                <RotateCcw className="w-4 h-4" /> Try again
              </button>
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
