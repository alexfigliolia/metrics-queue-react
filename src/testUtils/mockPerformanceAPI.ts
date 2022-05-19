import type { HashTable } from "metrics-queue";

class MockPerformanceAPI {
  static marks: any[] = [];
  static measures: any[] = [];

  static now() {
    return Date.now();
  }

  static mark(name: string) {
    const mark = {
      name,
      time: Date.now(),
      type: "mark",
    };
    this.marks.push(mark);
    return mark;
  }

  static measure(name: string, start?: string, end?: string) {
    const measure = {
      name,
      time: Date.now(),
      type: "measure",
      startMark: start,
      endMark: end,
    };
    this.measures.push(measure);
    return measure;
  }

  static getEntriesByName(name: string) {
    return [
      ...this.marks.filter(({ name: mark }) => mark === name),
      ...this.measures.filter(({ name: measure }) => measure === name),
    ];
  }

  static getEntriesByType(type: string) {
    return type === "measure" ? this.measures : this.marks;
  }

  static clearMarks() {
    this.marks = [];
  }

  static clearMeasures() {
    this.measures = [];
  }

  static reset() {
    this.clearMarks();
    this.clearMeasures();
    return this;
  }
}

export const mockPerformanceAPI = (obj: HashTable<any>, target = "performance") => {
  Object.defineProperty(obj, target, {
    value: MockPerformanceAPI.reset(),
    writable: true,
  });
};
