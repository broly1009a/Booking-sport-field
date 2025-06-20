import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
export const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day} / ${month} / ${year}`;
};

export const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}h${minutes}`;
};

export const formatTimeSchedule = (input) => {
    if (typeof input === 'string' && input.includes(':')) {
        const [h, m] = input.split(':');
        return `${String((+h + 7) % 24).padStart(2, '0')}:${m}`;
    }
    const d = new Date(input);
    return `${String((d.getHours() + 7) % 24).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatTimeVN = (date) => {
  const d = new Date(date);
  d.setHours(d.getHours()); // GMT+7
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};


export function formatBookingHourUTC(isoString) {
  if (!isoString) return '';
  const date = dayjs.utc(isoString);
  return date.format('HH:mm');
}

export function formatBookingTimeUTC(isoString, withTime = true) {
  if (!isoString) return '';
  const date = dayjs.utc(isoString);
  return withTime
    ? date.format('HH:mm DD/MM/YYYY')
    : date.format('DD/MM/YYYY');
}