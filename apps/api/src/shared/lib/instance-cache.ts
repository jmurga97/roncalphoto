export function getOrCreateInstance<Key extends object, Value>(
  cache: WeakMap<Key, Value>,
  key: Key,
  create: () => Value,
): Value {
  const existingValue = cache.get(key);

  if (existingValue) {
    return existingValue;
  }

  const value = create();
  cache.set(key, value);

  return value;
}
