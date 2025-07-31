import { FC } from "react";
import { DocumentModel, ID } from "./document-model";
import { Author, Subgraph, ImportScript, AnalyticsStore, RelationalDb, Processor, ListenerFilter } from "./stub-types";

export type DocumentModelModule = {
  id: string;
  name: string;
  documentModel: DocumentModel<any, any>;
  documentType: string;
  description: string;
  extension: string;
  author: Author;
};

export type EditorModule = {
  id: string;
  name: string;
  documentModelIds: ID[];
  editor: FC;
};

export type SubgraphModule = {
  id: string;
  name: string;
  gql: string;
  endpoint: string;
  subgraph: Subgraph;
};

export type ImportScriptModule = {
  id: string;
  name: string;
  gql: string;
  endpoint: string;
  documentTypes: string[];
  importScript: ImportScript;
};

export type ProcessorModule = {
  id: string;
  name: string;
  analyticsStore: AnalyticsStore;
  relationalDb: RelationalDb;
  processor: Processor;
  filter: ListenerFilter;
};