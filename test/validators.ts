import { ActionsSchema, DocumentModelSchema, DocumentSchema, TActions, TDocument, TDocumentModel } from "./document-model";

export function isDocumentModelOfType<T extends TDocumentModel>(documentModel: unknown): documentModel is T {
  return DocumentModelSchema.safeParse(documentModel).success;
}

export function isDocumentOfType<T extends TDocument>(document: unknown): document is T {
  return DocumentSchema.safeParse(document).success;
}

export function isActionOfType<T extends TActions>(action: unknown): action is T {
  return ActionsSchema.safeParse(action).success;
}