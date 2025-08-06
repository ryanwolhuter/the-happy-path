import z from "zod";
import { constantCase, pascalCase } from "change-case";
import { ScalarName, scalars } from "./scalars";



export function makePrimitiveFieldSchemaString(name: string, typeName: ScalarName, nullable: boolean) {
  const scalar = scalars[typeName];
  if (nullable) {
    return `${name}: ${scalar.typeName}Schema.optional()`;
  }
  return `${name}: ${scalar.typeName}Schema`;
}

export function makeArrayFieldSchemaString(name: string, itemType: {
  name: string;
  typeName: ScalarName;
  nullable: boolean;
}, nullable: boolean) {
  const itemTypeScalar = scalars[itemType.typeName];
  if (nullable) {
    if (itemType.nullable) {
      return `${name}: z.array(${itemTypeScalar.typeName}Schema.optional()).optional()`;
    }
    return `${name}: z.array(${itemTypeScalar.typeName}Schema).optional()`;
  }
  if (itemType.nullable) {
    return `${name}: z.array(${itemTypeScalar.typeName}Schema.optional())`;
  }
  return `${name}: z.array(${itemTypeScalar.typeName}Schema)`;
}

export type StateSchemaPrimitiveField = {
  type: 'primitive';
  name: string;
  typeName: ScalarName;
  nullable: boolean;
}

export type StateSchemaArrayField = {
  type: 'array';
  name: string,
  itemType: {
    name: string;
    typeName: ScalarName;
    nullable: boolean;
  },
  nullable: boolean
}

export type Fields = (StateSchemaPrimitiveField | StateSchemaArrayField)[]
export function makeZodFieldsSchemaString(fields: Fields) {
  return fields.map((field) => {
    switch (field.type) {
      case 'primitive':
        return makePrimitiveFieldSchemaString(field.name, field.typeName, field.nullable);
      case 'array':
        return makeArrayFieldSchemaString(field.name, field.itemType, field.nullable);
    }
  })
}

export function makeZodObjectStringFromFields(fields: Fields) {
  return `z.object({
  ${makeZodFieldsSchemaString(fields).join(',\n  ')}
})`
}

export function makeStateZodSchemaString(scope: string, fields: Fields) {
  const stateSchemaObjectString = makeZodObjectStringFromFields(fields);
  const pascalScope = pascalCase(scope);

  return `export const ${pascalScope}StateSchema = ${stateSchemaObjectString};

export type ${pascalScope}State = z.infer<typeof ${pascalScope}StateSchema>;
`
}

export function makeActionZodSchemaString(scope: string, type: string, fields: (StateSchemaPrimitiveField | StateSchemaArrayField)[]) {
  const inputSchemaObjectString = makeZodObjectStringFromFields(fields);
  const pascalType = pascalCase(type);
  const constantCaseType = constantCase(type);
  const lowercaseScope = scope.toLowerCase();
  const scopeSchemaString = `z.literal('${lowercaseScope}')`;
  const typeSchemaString = `z.literal('${constantCaseType}')`;
  const actionSchemaString = `z.object({
    scope: ${scopeSchemaString},
    type: ${typeSchemaString},
    input: ${inputSchemaObjectString},
  })`;
  return `export const ${pascalType}ActionInputSchema = ${inputSchemaObjectString};
export const ${pascalType}ActionSchema = ${actionSchemaString};
export type ${pascalType}ActionInput = z.infer<typeof ${pascalType}ActionInputSchema>;
export type ${pascalType}Action = z.infer<typeof ${pascalType}ActionSchema>;
`;
}

export function makeStateGraphqlSchema(scope: string, fields: (StateSchemaPrimitiveField | StateSchemaArrayField)[]) {
  const fieldSchemas = fields.map((field) => {
    switch (field.type) {
      case 'primitive':
        return `  ${field.name}: ${scalars[field.typeName].typeName}${field.nullable ? '' : '!'}`;
      case 'array':
        return `  ${field.name}: [${scalars[field.itemType.typeName].typeName}${field.itemType.nullable ? '' : '!'}]${field.nullable ? '' : '!'}`;
    }
  })
  return `type ${scope}State {
${fieldSchemas.join('\n')}
}
`
}

export async function makeDocumentModelJsonSchema(scope: string, stateSchemaPath: string, graphqlSchema: string) {
  const stateSchemaFile = await import(stateSchemaPath);
  const schemaName = `${pascalCase(scope)}StateSchema`;
  if (!(schemaName in stateSchemaFile)) {
    throw new Error(`Schema ${schemaName} not found in state-schema.ts`);
  }
  const StateSchema = stateSchemaFile[schemaName as keyof typeof stateSchemaFile];
  const jsonSchema = z.toJSONSchema(StateSchema.extend({
    $schema: z.literal(`./state-schema.json`),
    graphqlSchema: z.literal(graphqlSchema),
  }));
  return JSON.stringify(jsonSchema, null, 2);
}
