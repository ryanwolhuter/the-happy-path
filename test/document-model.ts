import { z } from "zod";
import { BaseDocumentModelSchema, BaseDocumentSchema } from "../src/schemas";
import { DOCUMENT_TYPE, FILE_EXTENSION } from "./constants";
import { StateSchema } from "./state";
import * as Actions from "./actions";

export const ActionsSchema = z.union(Object.values(Actions));
export type TActions = z.infer<typeof ActionsSchema>;
export const DocumentTypeSchema = z.literal(DOCUMENT_TYPE);
export const FileExtensionSchema = z.literal(FILE_EXTENSION);

export const DocumentSchema = BaseDocumentSchema.extend({
  type: DocumentTypeSchema,
  state: StateSchema,
})
export type TDocument = z.infer<typeof DocumentSchema>;

const CreateReducerFactory = z.function({
  input: [DocumentSchema, ActionsSchema],
  output: DocumentSchema,
})

export type TReducer = (document: TDocument, action: TActions) => TDocument

export function createReducer(reducer: TReducer): TReducer {
  return CreateReducerFactory.implement(reducer);
}

export const DocumentModelSchema = BaseDocumentModelSchema.extend({
  documentType: DocumentTypeSchema,
  fileExtension: FileExtensionSchema,
  state: StateSchema,
});

export type TDocumentModel = {
  reducer: TReducer;
} & z.infer<typeof DocumentModelSchema>;
