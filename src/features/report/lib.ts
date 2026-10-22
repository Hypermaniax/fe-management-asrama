const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export function monthLabel(year: number, month: number) {
  return `${MONTHS[month - 1] ?? month} ${year}`
}

export function startOfDay(date: string) {
  return `${date}T00:00:00.000Z`
}

export function endOfDay(date: string) {
  return `${date}T23:59:59.999Z`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}
