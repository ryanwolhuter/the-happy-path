import { z } from "zod";
import { OIDSchema, PHIDSchema, StringSchema } from "./scalars";

export const DocumentTypeSchema = StringSchema;
export const DocumentTypesSchema = z.array(DocumentTypeSchema);
export const ScopeSchema = StringSchema;
export const DescriptionSchema = StringSchema;
export const ExtensionSchema = StringSchema;
export const GqlSchema = StringSchema;
export const CategorySchema = StringSchema;
export const NameSchema = StringSchema;
export const UrlSchema = z.url();
export const EndpointSchema = UrlSchema;


export const AuthorSchema = z.object({
  name: NameSchema,
  url: UrlSchema,
});

export const BaseActionSchema = z.object({
  scope: ScopeSchema,
  type: StringSchema,
  input: z.unknown(),
});

export const BaseStateSchema = z.unknown();

export const HeaderSchema = z.object({
  id: OIDSchema,
  name: NameSchema,
  documentType: DocumentTypeSchema,
  documentModelId: PHIDSchema,
  preferredEditorId: PHIDSchema.optional(),
});

export const OperationSchema = z.object({
  type: StringSchema,
  input: z.unknown(),
  signer: z.unknown(),
});

export const OperationsSchema = z.array(OperationSchema);

export const BaseDocumentSchema = z.object({
  header: HeaderSchema,
  state: BaseStateSchema,
  operations: OperationsSchema,
});


export const BaseDocumentModelSchema = z.object({
  id: PHIDSchema,
  documentType: DocumentTypeSchema,
  name: NameSchema,
});

export const VetraMetaSchema = z.object({
  id: PHIDSchema,
  name: NameSchema,
});

export const BaseDocumentModelModuleSchema = VetraMetaSchema.extend({
  documentModel: BaseDocumentModelSchema,
  initialState: BaseStateSchema,
  description: DescriptionSchema,
  author: AuthorSchema,
});

export const DocumentModelModulesSchema = z.array(BaseDocumentModelModuleSchema);

export const EditorSchema = z.function({
  input: [BaseDocumentSchema],
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
