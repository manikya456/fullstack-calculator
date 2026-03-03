export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return 'Error'
  }

  if (Number.isInteger(value)) {
    return String(value)
  }

  return String(Number(value.toFixed(8)))
}
