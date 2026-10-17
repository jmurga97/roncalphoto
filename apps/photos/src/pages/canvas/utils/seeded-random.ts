/**
 * FNV-1a hash: turns a string into a deterministic 32-bit unsigned seed.
 */
export function hashString(input: string): number {
  let hash = 2_166_136_261;

  for (let index = 0; index < input.length; index += 1) {
    // oxlint-disable-next-line unicorn/prefer-code-point -- Preserve the existing UTF-16 hash and stable photo layout.
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

/**
 * Mulberry32 PRNG: deterministic sequence in [0, 1) for a given seed.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    // oxlint-disable-next-line unicorn/prefer-math-trunc -- Mulberry32 requires signed 32-bit overflow, not truncation.
    state = (state + 1_831_565_813) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}
