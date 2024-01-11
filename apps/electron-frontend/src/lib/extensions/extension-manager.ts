import { isWindow } from 'ui/utils/is-window';

if (isWindow) {
  const worker = new Worker(new URL('./extension.worker.ts', import.meta.url));
  console.log("worker", worker);
  worker.postMessage({ a: 1 });
  worker.onmessage = (event) => {
    console.log("receive from worker", event);
  };
}

export default null