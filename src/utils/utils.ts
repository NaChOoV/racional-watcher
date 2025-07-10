export function runInBackground<T extends any[]>(
    fn: (...args: T) => Promise<void>,
    ...args: T
): void {
    Promise.resolve()
        .then(() => fn(...args))
        .catch(console.error);
}
