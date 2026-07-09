const MAX_CONCURRENT = 3;
const MAX_PER_SECOND = 8;

type Resolve = () => void;

let activeCount = 0;
const waitQueue: Resolve[] = [];

const windowTimestamps: number[] = [];

function slideWindow() {
  const t = Date.now();
  while (windowTimestamps.length > 0 && windowTimestamps[0] < t - 1000) {
    windowTimestamps.shift();
  }
}

function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    slideWindow();
    if (windowTimestamps.length < MAX_PER_SECOND) {
      activeCount++;
      windowTimestamps.push(Date.now());
      return Promise.resolve();
    }
  }
  return new Promise((resolve) => {
    waitQueue.push(resolve);
  });
}

function releaseSlot() {
  activeCount--;
  while (waitQueue.length > 0) {
    slideWindow();
    if (windowTimestamps.length >= MAX_PER_SECOND) break;
    const next = waitQueue.shift()!;
    activeCount++;
    windowTimestamps.push(Date.now());
    next();
    break;
  }
}

export async function throttledFetch(url: string, options?: RequestInit): Promise<Response> {
  await acquireSlot();
  try {
    return await fetch(url, options);
  } finally {
    releaseSlot();
  }
}

export function resetThrottleForTesting() {
  activeCount = 0;
  waitQueue.length = 0;
  windowTimestamps.length = 0;
}
