import { z } from "zod";
import { VetraMetaSchema, DocumentModelSchema, ActionSchema, DocumentSchema } from "./schemas";
import { myDocumentType } from "./my-document-model";

export const Scope1StateSchema = z.object({
  something: z.string(),
});

export const Scope2StateSchema = z.object({
  somethingElse: z.number(),
});

export const Scope3StateSchema = z.object({
  someNumbers: z.array(z.number()),
});

export const MyStateSchema = z.object({
  scope1: Scope1StateSchema,
  scope2: Scope2StateSchema,
  scope3: Scope3StateSchema,
});

export const Action1InputSchema = z.object({
  something: z.string(),
});

export const Action1Schema = ActionSchema.extend({
  type: z.literal("action1"),
  input: Action1InputSchema,
  scope: z.literal("scope1"),
});

export const Action2InputSchema = z.object({  
  somethingElse: z.number(),
});

export const Action2Schema = ActionSchema.extend({
  type: z.literal("action2"),
  input: Action2InputSchema,
  scope: z.literal("scope2"),
});

export const Action3InputSchema = z.object({
  someNumbers: z.array(z.number()),
});

export const Action3Schema = ActionSchema.extend({ 
  type: z.literal("action3"),
  input: Action3InputSchema,
  scope: z.literal("scope3"),
});

const myActionSchemas = [Action1Schema, Action2Schema, Action3Schema] as const;
const MyActionSchema = z.union(myActionSchemas);
const MyActionTypeSchema = z.union(myActionSchemas.map(s => s.shape.type));
export const MyActionsSchema = z.record(MyActionTypeSchema, MyActionSchema);

export const MyDocumentSchema = DocumentSchema.extend({
  state: MyStateSchema,
});

export const MyReducerFactory = z.function({
  input: [MyDocumentSchema, MyActionSchema],
  output: MyDocumentSchema,
})

export const MyDocumentModelSchema = DocumentModelSchema.extend({
  documentType: z.literal(myDocumentType),
  actions: MyActionsSchema,
  reducer: MyReducerFactory,
});

export const MyDocumentModelModuleSchema = VetraMetaSchema.extend({
  documentModel: MyDocumentModelSchema,
});