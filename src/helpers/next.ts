/** Helper function to automatically create an Observer object with only a `next` value (because directly passing the `next` callback is deprecated) */
export const next = <T>(onNext: (value: T) => void) => ({ next: onNext });
