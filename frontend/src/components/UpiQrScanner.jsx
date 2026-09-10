import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Camera, CameraOff, LoaderCircle } from 'lucide-react'

function UpiQrScanner({ onScan, onError, onClose }) {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [isStarting, setIsStarting] = useState(true)

  useEffect(() => {
    if (!videoRef.current) return undefined

    const scanner = new QrScanner(
      videoRef.current,
      (result) => onScan(result.data),
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        maxScansPerSecond: 5,
        onDecodeError: () => {},
      },
    )

    scannerRef.current = scanner
    scanner.start()
      .then(() => setIsStarting(false))
      .catch((error) => {
        setIsStarting(false)
        onError(error)
      })

    return () => {
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }
  }, [onError, onScan])

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-950/80 p-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-black aspect-square max-w-sm mx-auto">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 text-slate-200 text-sm">
            <LoaderCircle className="w-6 h-6 animate-spin text-blue-400" />
            Requesting camera access...
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><Camera className="w-4 h-4 text-blue-400" /> Point the camera at a UPI QR code.</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800 transition"
        >
          <CameraOff className="w-4 h-4" />
          Close
        </button>
      </div>
    </div>
  )
}

export default UpiQrScanner
