import { DocumentModelModule, EditorModule, SubgraphModule, ImportScriptModule, ProcessorModule } from "./modules";
import { Author } from "./stub-types";

export type VetraMeta = {
  id: string;
  name: string;
};

export type VetraModule = Record<string, unknown> & VetraMeta 

export type VetraPackageMeta = {
  id: string;
  name: string;
  description: string;
  category: string;
  author: Author;
}

type BaseVetraPackage<TModules extends { [K in keyof TModules]: VetraMeta[] }> = VetraPackageMeta & {
  modules: {
    [K in keyof TModules]: TModules[K]
  }
};

export type VetraModules = {
  documentModelModules?: DocumentModelModule[];
  editorModules?: EditorModule[];
  subgraphModules?: SubgraphModule[];
  importScriptModules?: ImportScriptModule[];
  processorModules?: ProcessorModule[];
};

export type VetraPackage = BaseVetraPackage<VetraModules>;

export type VetraPackageManifest = VetraPackageMeta & {
  modules: {
    [K in keyof VetraModules]: VetraMeta[]
  }
}