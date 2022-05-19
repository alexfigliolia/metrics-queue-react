export class PerfLibMetric {
  name: string;
  time = 0;
  callbacks: ((...args: any[]) => any)[] = [];
  constructor(name: string) {
    this.name = name;
  }
  stop() {
    this.time = Date.now();
    this.onStop();
  }
  onStop() {
    this.callbacks.forEach((callback) => {
      callback(this);
    });
  }
  subscribe(func: (...args: any[]) => any) {
    this.callbacks.push(func);
  }
}
