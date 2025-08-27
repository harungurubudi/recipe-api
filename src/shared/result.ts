export type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a Result that represents a successful result.
 *
 * @param value The value of the successful result.
 * @returns A Result with ok set to true and value set to the given value.
 */
export function ok<T, E>(value: T): Result<T, E> {
  return { ok: true, value };
}

/**
 * Create a Result that represents an error.
 *
 * @param error The value of the error.
 * @returns A Result with ok set to false and error set to the given value.
 */
export function error<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}