import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QrScanner from 'qr-scanner'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Image,
  LoaderCircle,
  MapPin,
  ScanLine,
  Send,
  Smartphone,
} from 'lucide-react'
import UpiQrScanner from '../components/UpiQrScanner'
import { getBrowserDeviceLabel, isValidUpiRecipient, parseUpiPayload } from '../utils/upi'

const MANUAL_LOCATIONS = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Kolkata', 'Hyderabad', 'Other']

function PaymentSafetyCheck() {
  const navigate = useNavigate()
  const [upiInput, setUpiInput] = useState('')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [payeeName, setPayeeName] = useState('')
  const [category, setCategory] = useState('')
  const [device] = useState(() => getBrowserDeviceLabel())
  const [location, setLocation] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isReadingImage, setIsReadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const imageInputRef = useRef(null)
  const previewUrlRef = useRef('')
  const [locationStatus, setLocationStatus] = useState(() => (
    typeof navigator !== 'undefined' && navigator.geolocation ? 'requesting' : 'unavailable'
  ))

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = coords.latitude.toFixed(5)
        const longitude = coords.longitude.toFixed(5)
        setLocation(`GPS coordinates (${latitude}, ${longitude})`)
        setLocationStatus('obtained')
      },
      () => {
        setLocationStatus('unavailable')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )

    return undefined
  }, [])

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  const handleQrScan = useCallback((payload) => {
    try {
      const parsedPayment = parseUpiPayload(payload)
      setRecipient(parsedPayment.recipient)
      setPayeeName(parsedPayment.payeeName)
      if (parsedPayment.amount) setAmount(parsedPayment.amount)
      setIsScanning(false)
      setErrorMessage('')
      return true
    } catch (error) {
      setErrorMessage(error.message || 'Unable to read this QR code.')
      return false
    }
  }, [])

  const handleScannerError = useCallback((error) => {
    const message = error?.name === 'NotAllowedError'
      ? 'Camera permission was denied. You can enter a UPI ID manually.'
      : 'Unable to start the camera. Check browser permissions or enter a UPI ID manually.'
    setErrorMessage(message)
    setIsScanning(false)
  }, [])

  const handleImageSelection = async (event) => {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file containing a QR code.')
      return
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const previewUrl = URL.createObjectURL(selectedFile)
    previewUrlRef.current = previewUrl
    setImagePreview(previewUrl)
    setIsReadingImage(true)
    setErrorMessage('')

    try {
      const result = await QrScanner.scanImage(selectedFile, {
        returnDetailedScanResult: true,
      })
      if (handleQrScan(result.data)) setErrorMessage('QR code detected successfully')
    } catch {
      setErrorMessage('No readable QR code was found in the selected image.')
    } finally {
      setIsReadingImage(false)
    }
  }

  const handleUpiCheck = (event) => {
    event.preventDefault()
    const normalizedValue = upiInput.trim()
    if (!isValidUpiRecipient(normalizedValue)) {
      setErrorMessage('Enter a valid UPI ID such as merchant@upi or a payment number.')
      return
    }

    setRecipient(normalizedValue)
    setPayeeName('')
    setErrorMessage('')
  }

  const handleLocationChange = (event) => {
    const selectedLocation = event.target.value
    setLocation(selectedLocation === 'Other' ? '' : selectedLocation)
    if (selectedLocation !== 'Other') setCustomLocation('')
  }

  const analyzePayment = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const parsedAmount = Number(amount)
    const finalLocation = location || customLocation.trim()
    if (!recipient.trim()) {
      setErrorMessage('Scan a UPI QR code or check a UPI ID before analyzing.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Enter a valid payment amount greater than 0.')
      return
    }
    if (!finalLocation) {
      setErrorMessage('Select a location or enter one manually before analyzing.')
      return
    }
    if (!device) {
      setErrorMessage('Browser device information is unavailable.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          recipient: recipient.trim(),
          device,
          location: finalLocation,
          user_id: 'user_101',
          ...(category ? { category } : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.detail || `Analysis failed with status ${response.status}.`)
      }

      navigate('/risk-result', { state: await response.json() })
    } catch (error) {
      const isNetworkError = error.name === 'TypeError' || error.message?.includes('fetch')
      setErrorMessage(isNetworkError
        ? 'Unable to connect to the AI analysis server. Make sure the backend is running.'
        : error.message || 'Unable to analyze this payment.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedManualLocation = MANUAL_LOCATIONS.includes(location) ? location : ''
  const locationMessage = locationStatus === 'obtained'
    ? 'Location obtained from browser permission. You may replace it with a city.'
    : locationStatus === 'requesting'
    ? 'Requesting browser location permission...'
    : 'Location permission was denied or unavailable. Select a location manually.'

  return (
    <main className="min-h-screen pt-28 sm:pt-32 px-4 sm:px-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ScanLine className="w-3.5 h-3.5" />
            Real-time payment review
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Payment Safety Check</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Read payment details from a UPI QR code or check a UPI ID with the existing AI risk pipeline.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <section className="p-5 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { setErrorMessage(''); setIsScanning(true) }}
              disabled={isScanning || isReadingImage || isLoading}
              className="min-h-14 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition"
            >
              <Camera className="w-5 h-5" />
              Scan QR Code
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isScanning || isReadingImage || isLoading}
              className="min-h-14 rounded-xl border border-cyan-500/40 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition"
            >
              <Image className="w-5 h-5 text-cyan-300" />
              {isReadingImage ? 'Reading QR Image...' : 'Choose from Gallery'}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelection}
              className="hidden"
            />
          </div>

          <div className="mt-4 flex items-center gap-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            <span>or check a UPI ID</span>
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="mt-3">
            <form onSubmit={handleUpiCheck} className="flex gap-2">
              <input
                value={upiInput}
                onChange={(event) => setUpiInput(event.target.value)}
                disabled={isLoading}
                placeholder="merchant@upi or number"
                aria-label="UPI ID or payment number"
                className="min-w-0 flex-1 px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" disabled={isLoading} className="px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold transition disabled:opacity-60">
                Check UPI
              </button>
            </form>
          </div>

          {imagePreview && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <img src={imagePreview} alt="Selected QR code preview" className="h-20 w-20 rounded-lg object-cover" />
              <div className="text-xs text-slate-400">
                <span className="block font-semibold text-slate-200">Selected QR image</span>
                <span className="mt-1 block">The image is decoded locally in your browser and is not uploaded.</span>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="mt-5">
              <UpiQrScanner onScan={handleQrScan} onError={handleScannerError} onClose={() => setIsScanning(false)} />
            </div>
          )}

          <form onSubmit={analyzePayment} className="mt-8 border-t border-slate-800 pt-7">
            <h2 className="text-xl font-bold text-white">Payment Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                Amount (₹)
                <input type="number" min="0.01" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={isLoading} placeholder="Required if QR has no amount" className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
              </label>
              <label className="text-sm text-slate-300">
                Category <span className="text-slate-500">(optional)</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={isLoading} className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500">
                  <option value="">Not selected</option>
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Shopping</option>
                  <option>Bills</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">
                Recipient
                <input value={recipient} onChange={(event) => setRecipient(event.target.value)} disabled={isLoading} placeholder="UPI ID or payment number" className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
              </label>
              <label className="text-sm text-slate-300">
                Payee Name <span className="text-slate-500">(from QR, if available)</span>
                <input value={payeeName} onChange={(event) => setPayeeName(event.target.value)} disabled={isLoading} placeholder="Not provided" className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
              </label>
              <label className="text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-cyan-400" /> Device</span>
                <input value={device} readOnly placeholder="Browser information unavailable" className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-400" /> Location</span>
                <select value={selectedManualLocation} onChange={handleLocationChange} disabled={isLoading} className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500">
                  <option value="">Select a location manually</option>
                  {MANUAL_LOCATIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                {selectedManualLocation === '' && (
                  <input value={customLocation} onChange={(event) => { setCustomLocation(event.target.value); setLocation('') }} disabled={isLoading} placeholder="Or enter a city / area" className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                )}
                <span className="mt-2 block text-xs text-slate-500">{locationMessage}</span>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="mt-7 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition">
              {isLoading ? <><LoaderCircle className="w-5 h-5 animate-spin" /> Analyzing with AI...</> : <><Send className="w-4 h-4" /> Analyze Payment</>}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Analysis uses the existing behavioral, rules, and LightGBM pipeline.
          </div>
        </section>
      </div>
    </main>
  )
}

export default PaymentSafetyCheck
