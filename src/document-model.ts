import z from "zod";
import { Operation, Signer } from "./stub-types";
import { HeaderSchema, ActionSchema, StateSchema, OperationsSchema, DocumentModelSchema } from "./schemas";

export type ID = string;

export type PHDocumentHeader = { id: ID; name: string; documentModelId: ID; documentType: string; preferredEditorId: ID | null };
export type Action = {
  type: string;
  input: unknown;
  scope: string;
  signer: Signer;
};

export type PHDocument<TState = unknown> = {
  header: PHDocumentHeader;
  meta?: {
    preferredEditorId?: ID;
  }
  state: TState;
  operations: Operation[];
}

export type Reducer<TState, TAction extends Action>= (document: PHDocument<TState>, action: TAction) => PHDocument<TState>;

export type DocumentModel<TState = any, TAction extends Action = any> = {
  id: ID;
  name: string;
  documentType: string;
  reducer: Reducer<TState, TAction>;
  actions: Record<TAction["type"], TAction>;
};

export type PHDocumentHeaderFromSchema = z.infer<typeof HeaderSchema>;

export type ActionFromSchema = z.infer<typeof ActionSchema>;

export type ActionsFromSchema = z.infer<typeof ActionSchema>;

export type StateFromSchema = z.infer<typeof StateSchema>;

export type StatesFromSchema = z.infer<typeof StateSchema>;

export type OperationsFromSchema = z.infer<typeof OperationsSchema>;

export type DocumentModelFromSchema = z.infer<typeof DocumentModelSchema>;