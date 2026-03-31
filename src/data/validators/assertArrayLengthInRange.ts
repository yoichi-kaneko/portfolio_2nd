export function assertArrayLengthInRange(
  targetName: string,
  target: unknown[],
  min: number,
  max: number
): void {
  if (target.length < min || target.length > max) {
    throw new Error(
      `[data-validation] ${targetName} must contain between ${min} and ${max} items, but received ${target.length}.`
    );
  }
}
