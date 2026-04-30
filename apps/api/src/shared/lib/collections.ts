export function groupValuesBy<Key, Row, Value>(
  rows: Row[],
  getKey: (row: Row) => Key,
  mapValue: (row: Row) => Value,
): Map<Key, Value[]> {
  const groupedValues = new Map<Key, Value[]>();

  for (const row of rows) {
    const key = getKey(row);
    const value = mapValue(row);
    const currentValues = groupedValues.get(key);

    if (currentValues) {
      currentValues.push(value);
      continue;
    }

    groupedValues.set(key, [value]);
  }

  return groupedValues;
}
