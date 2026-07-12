export function localDateISO(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function parseLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00`)
}
