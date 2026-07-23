import dayjs from 'dayjs'

export function formatDate(value: string | Date | number, format = 'YYYY-MM-DD') {
  return dayjs(value).format(format)
}

export function isValidDate(value: string | Date | number) {
  return dayjs(value).isValid()
}

export function addDays(value: string | Date | number, days: number) {
  return dayjs(value).add(days, 'day').toDate()
}
