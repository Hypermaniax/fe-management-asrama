const jakartaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Jakarta',
})

export function dateInput(value: string) {
  return jakartaDateFormatter.format(new Date(value))
}

export function todayDate() {
  return jakartaDateFormatter.format(new Date())
}

export function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

export function scopeLabel(buildingName?: string | null) {
  return buildingName ?? 'Asrama'
}
