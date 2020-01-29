export interface CacheDoc {
  key: string,
  value: any
}

export interface CacheGetOptions {
  strategy?: CacheStrategies
}

export enum CacheStrategies {
  CacheFirst,
  NetworkFirst,
  CacheOnly,
  NetworkOnly,
  StaleWhileRevalidate
}
