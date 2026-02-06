let activeCount = 0;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(activeCount));
}

export function startLoading() {
  activeCount += 1;
  notify();
}

export function stopLoading() {
  activeCount = Math.max(0, activeCount - 1);
  notify();
}

export function subscribeLoading(fn) {
  listeners.add(fn);
  fn(activeCount);
  return () => listeners.delete(fn);
}
