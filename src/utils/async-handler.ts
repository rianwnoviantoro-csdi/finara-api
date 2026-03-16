export async function asyncHandler<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}

export function wrapAsync<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => fn(...args);
}
