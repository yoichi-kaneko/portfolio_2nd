export function assertArrayMinLength(
  targetName: string,
  target: unknown[],
  min: number
): void {
  if (target.length < min) {
    throw new Error(
      `[data-validation] ${targetName} must contain at least ${min} items, but received ${target.length}.`
    );
  }
}
