import type { MokeWorkoutRecord, MokeWorkoutTotals } from '../moke/types';

export function mergeWorkoutRecords(
  existingRecords: MokeWorkoutRecord[],
  incomingRecords: MokeWorkoutRecord[],
): MokeWorkoutRecord[] {
  return [...new Map([...existingRecords, ...incomingRecords].map((record) => [record._id, record])).values()]
    .sort((left, right) => right.startTime.localeCompare(left.startTime));
}

export function addMissingWorkoutTotals(
  totals: MokeWorkoutTotals,
  existingRecords: MokeWorkoutRecord[],
  incomingRecords: MokeWorkoutRecord[],
): MokeWorkoutTotals {
  const existingIds = new Set(existingRecords.map((record) => record._id));
  const missingRecords = incomingRecords.filter((record) => !existingIds.has(record._id));

  if (missingRecords.length === 0) {
    return totals;
  }

  return {
    ...totals,
    totalDistance: totals.totalDistance + missingRecords.reduce((sum, record) => sum + record.sumMileage, 0),
    totalCalorie: totals.totalCalorie + missingRecords.reduce((sum, record) => sum + record.sumCalorie, 0),
    totalDuration: totals.totalDuration + missingRecords.reduce((sum, record) => sum + record.sumDuration, 0),
    sportCount: (totals.sportCount ?? 0) + missingRecords.length,
  };
}

export function summarizeWorkoutTotals(records: MokeWorkoutRecord[]): MokeWorkoutTotals {
  return records.reduce(
    (totals, record) => {
      totals.totalDistance += record.sumMileage;
      totals.totalCalorie += record.sumCalorie;
      totals.totalDuration += record.sumDuration;
      totals.sportCount += 1;
      return totals;
    },
    { totalDistance: 0, totalCalorie: 0, totalDuration: 0, sportCount: 0 },
  );
}
