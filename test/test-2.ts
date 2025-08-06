import z from "zod";
import { DocumentModelSchema } from "./document-model";
import { writeFileSync } from "fs";

const DocumentModelJsonSchema = DocumentModelSchema.extend({
  $schema: z.literal("./document-model-json-schema.json"),
});
const documentModelJsonSchema = z.toJSONSchema(DocumentModelJsonSchema);

writeFileSync("./test/document-model-json-schema.json", JSON.stringify(documentModelJsonSchema, null, 2));

const documentModel: z.infer<typeof DocumentModelJsonSchema> = {
  $schema: "./document-model-json-schema.json",
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "My Test Document Model",
  documentType: "my-org/test",
  fileExtension: ".test",
  state: {
    global: {
      globalStuff: [],
    },
    other: {
      id: "other",
      ids: [],
    },
  },

};


writeFileSync("./test/document-model.json", JSON.stringify(documentModel, null, 2));