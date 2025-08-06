export type Subgraph = any;
export type ImportScript = any;
export type AnalyticsStore = any;
export type RelationalDb = any;
export type Processor = any;
export type ListenerFilter = any;
export type User = any;
export type Author = any;
export type Signer = {
  address: string;
  networkId: string;
  chainId: number;
};
export type Operation = any;
export type DocumentModelUtils = any;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};