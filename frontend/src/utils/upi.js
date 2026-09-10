const UPI_ID_PATTERN = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/
const PHONE_NUMBER_PATTERN = /^\+?[0-9]{10,15}$/

export function isValidUpiRecipient(value) {
  const normalizedValue = value.trim()
  return UPI_ID_PATTERN.test(normalizedValue) || PHONE_NUMBER_PATTERN.test(normalizedValue)
}

export function parseUpiPayload(payload) {
  const value = payload.trim()
  let parsedUrl

  try {
    parsedUrl = new URL(value)
  } catch {
    throw new Error('This QR code is not a valid payment link.')
  }

  if (parsedUrl.protocol.toLowerCase() !== 'upi:') {
    throw new Error('This QR code is not a UPI payment QR code.')
  }

  const recipient = parsedUrl.searchParams.get('pa')?.trim()
  if (!recipient || !isValidUpiRecipient(recipient)) {
    throw new Error('The UPI QR code does not contain a valid recipient ID.')
  }

  const amountValue = parsedUrl.searchParams.get('am')?.trim()
  let amount = ''
  if (amountValue) {
    const parsedAmount = Number(amountValue)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error('The UPI QR code contains an invalid amount.')
    }
    amount = String(parsedAmount)
  }

  return {
    recipient,
    payeeName: parsedUrl.searchParams.get('pn')?.trim() || '',
    amount,
  }
}

export function getBrowserDeviceLabel() {
  if (typeof navigator === 'undefined') {
    return ''
  }

  const mobile = navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)
  const platform = navigator.userAgentData?.platform || navigator.platform || 'browser device'
  return `${mobile ? 'Mobile' : 'Desktop'} browser (${platform})`
}
