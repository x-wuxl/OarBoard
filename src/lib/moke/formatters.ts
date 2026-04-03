const pad = (value: number): string => value.toString().padStart(2, '0');

export function formatDuration(seconds?: number | null): string {
  const safeSeconds = Number.isFinite(seconds) && (seconds ?? 0) > 0 ? Math.floor(Number(seconds)) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

export function formatDistanceKm(meters?: number | null): string {
  const safeMeters = Number.isFinite(meters) ? Number(meters) : 0;
  return `${(safeMeters / 1000).toFixed(2)} km`;
}

export function formatPacePer500m(speedKmh?: number | null): string {
  if (!speedKmh || !Number.isFinite(speedKmh) || speedKmh <= 0) {
    return '--:--/500m';
  }

  const totalSeconds = Math.round(1800 / speedKmh);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${pad(minutes)}:${pad(seconds)}/500m`;
}

export function formatTimestamp(input?: string | null): string {
  if (!input) {
    return '';
  }

  const normalized = input.includes('T') ? input : input.replace(' ', 'T');
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return input.slice(0, 16).replace('T', ' ');
  }

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function parseNumberSeries(series?: string | null): number[] {
  if (!series) {
    return [];
  }

  return series
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}
