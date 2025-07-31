import { z } from "zod";

export const IdSchema = z.uuid();
export const DocumentTypeSchema = z.string();
export const DocumentTypesSchema = z.array(DocumentTypeSchema);
export const ScopeSchema = z.string();

export const DescriptionSchema = z.string();
export const ExtensionSchema = z.string();
export const GqlSchema = z.string();
export const EndpointSchema = z.url();
export const CategorySchema = z.string();
export const NameSchema = z.string();
export const UrlSchema = z.url();

export const SignerSchema = z.object({
  address: z.string(),
  networkId: z.string(),
  chainId: z.number(),
});


export const AuthorSchema = z.object({
  name: NameSchema,
  url: UrlSchema,
});

export const ActionSchema = z.object({
  scope: ScopeSchema,
  type: z.string(),
  input: z.unknown(),
  signer: SignerSchema,
});

const ActionsSchema = z.record(ActionSchema.shape.type, ActionSchema);

export const StateSchema = z.unknown();

export const HeaderSchema = z.object({
  id: IdSchema,
  documentType: DocumentTypeSchema,
  documentModelId: IdSchema,
  preferredEditorId: IdSchema.nullable(),
  name: NameSchema,
});

export const OperationSchema = z.object({
  type: z.string(),
  input: z.unknown(),
  signer: z.unknown(),
});

export const OperationsSchema = z.array(OperationSchema);

export const DocumentSchema = z.object({
  header: HeaderSchema,
  state: StateSchema,
  operations: OperationsSchema,
});

export const ReducerFunctionFactory = z.function({
  input: [DocumentSchema, ActionSchema],
  output: DocumentSchema,
})

export const DocumentModelSchema = z.object({
  id: IdSchema,
  documentType: DocumentTypeSchema,
  name: NameSchema,
  actions: ActionsSchema,
  reducer: ReducerFunctionFactory
});

export const VetraMetaSchema = z.object({
  id: IdSchema,
  name: NameSchema,
});

export const DocumentModelModuleSchema = VetraMetaSchema.extend({
  documentModel: DocumentModelSchema,
  documentType: DocumentTypeSchema,
  description: DescriptionSchema,
  extension: ExtensionSchema,
  author: AuthorSchema,
});

export const DocumentModelModulesSchema = z.array(DocumentModelModuleSchema);

export const EditorSchema = z.function({
  input: [DocumentSchema],
});

export const EditorModuleSchema = VetraMetaSchema.extend({
  documentTypes: DocumentTypesSchema,
  editor: EditorSchema,
});

export const EditorModulesSchema = z.array(EditorModuleSchema);

export const SubgraphModuleSchema = VetraMetaSchema.extend({
  gql: GqlSchema,
  endpoint: EndpointSchema,
  subgraph: z.unknown(),
});

export const SubgraphModulesSchema = z.array(SubgraphModuleSchema);

export const ImportScriptModuleSchema = VetraMetaSchema.extend({
  gql: GqlSchema,
  endpoint: EndpointSchema,
  documentTypes: DocumentTypesSchema,
});

export const ImportScriptModulesSchema = z.array(ImportScriptModuleSchema);

export const ProcessorModuleSchema = VetraMetaSchema.extend({
  analyticsStore: z.unknown(),
  relationalDb: z.unknown(),
  processor: z.unknown(),
  filter: z.unknown(),
});

export const ProcessorModulesSchema = z.array(ProcessorModuleSchema);
