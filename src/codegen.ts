import z from "zod";
import fs from 'fs';
import { constantCase, pascalCase } from "change-case";

export const IDSchema = z.uuid();
export const StringSchema = z.string();
export const NumberSchema = z.number();
export const BooleanSchema = z.boolean();
export const DateSchema = z.date();
DateSchema.toString()
DateSchema.type
export const AmountCryptoSchema = z.object({
  amount: NumberSchema,
  currency: StringSchema,
});

export const scalars = {
  id: {
    schema: IDSchema,
    typeName: 'ID',
    description: 'A unique identifier for the object.',
  },
  string: {
    schema: StringSchema,
    typeName: 'String',
    description: 'A string value.',
  },
   number: {
    schema: NumberSchema,
    typeName: 'Number',
    description: 'A number value.',
  },
  boolean: {
    schema: BooleanSchema,
    typeName: 'Boolean',
    description: 'A boolean value.',
  },
  date: {
    schema: DateSchema,
    typeName: 'Date',
    description: 'A date value.',
  },
  amountCrypto: {
    schema: AmountCryptoSchema,
    typeName: 'AmountCrypto',
    description: 'An amount of crypto.',
  },
} as const;

type ScalarName = keyof typeof scalars;
const scalarNames = Object.keys(scalars) as ScalarName[];

function makePrimitiveFieldSchema(name: string, typeName: ScalarName, nullable: boolean) {
  const scalar = scalars[typeName];
  if (nullable) {
    return `${name}: ${scalar.typeName}Schema.optional()`;
  }
  return `${name}: ${scalar.typeName}Schema`;
}

function makeArrayFieldSchema(name: string, itemType: {
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

type StateSchemaPrimitiveField = {
  type: 'primitive';
  name: string;
  typeName: ScalarName;
  nullable: boolean;
}

type StateSchemaArrayField = {
  type: 'array';
  name: string,
  itemType: {
    name: string;
    typeName: ScalarName;
    nullable: boolean;
  },
  nullable: boolean
}

type Fields = (StateSchemaPrimitiveField | StateSchemaArrayField)[]
function makeZodFieldsSchema(fields: Fields) {
  return fields.map((field) => {
    switch (field.type) {
      case 'primitive':
        return makePrimitiveFieldSchema(field.name, field.typeName, field.nullable);
      case 'array':
        return makeArrayFieldSchema(field.name, field.itemType, field.nullable);
    }
  })
}

function makeZodObjectStringFromFields(fields: Fields) {
  return `z.object({
  ${makeZodFieldsSchema(fields).join(',\n  ')}
})`
}

function makeStateZodSchema(scope: string, fields: Fields) {
  const stateSchemaObjectString = makeZodObjectStringFromFields(fields);
  const pascalScope = pascalCase(scope);

  return `import { z } from 'zod';
import { IDSchema, StringSchema, NumberSchema, BooleanSchema, DateSchema, AmountCryptoSchema } from './codegen';

export const ${pascalScope}StateSchema = ${stateSchemaObjectString};

export type ${pascalScope}State = z.infer<typeof ${pascalScope}StateSchema>;
`
}

function makeActionZodSchema(scope: string, type: string, fields: (StateSchemaPrimitiveField | StateSchemaArrayField)[]) {
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
  return `import { z } from 'zod';
import { IDSchema, StringSchema, NumberSchema, BooleanSchema, DateSchema, AmountCryptoSchema } from './codegen';

export const ${pascalType}ActionInputSchema = ${inputSchemaObjectString};
export const ${pascalType}ActionSchema = ${actionSchemaString};

export type ${pascalType}ActionInput = z.infer<typeof ${pascalType}ActionInputSchema>;
export type ${pascalType}Action = z.infer<typeof ${pascalType}ActionSchema>;
`;
}

function makeStateGraphqlSchema(scope: string, fields: (StateSchemaPrimitiveField | StateSchemaArrayField)[]) {
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

async function makeStateJsonSchema(scope: string, graphqlSchema: string) {
  const stateSchemaFile = await import(`./state-schema`);
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

async function test() {
  const scope = 'Test';
  const testFields: (StateSchemaPrimitiveField | StateSchemaArrayField)[] = [
    {
      type: 'primitive',
      name: 'id',
      typeName: 'id',
      nullable: false,
    },
    {
      type: 'array',
      name: 'ids',
      itemType: {
        name: 'id',
        typeName: 'id',
        nullable: false,
      },
      nullable: false,
    },
    {
      type: 'primitive',
      name: 'name',
      typeName: 'string',
      nullable: true,
    },
    {
      type: 'array',
      name: 'names',
      itemType: {
        name: 'string',
        typeName: 'string',
        nullable: true,
      },
      nullable: true,
    },
  ]
  const stateSchema = makeStateZodSchema(scope, testFields);
  fs.writeFileSync(`./src/state-schema.ts`, stateSchema);
  const graphqlSchema = makeStateGraphqlSchema(scope, testFields);
  fs.writeFileSync(`./src/schema.graphql`, graphqlSchema);
  const graphqlSchemaWithoutNewlines = graphqlSchema.replace(/\s+/g, ' ').trim();
  const jsonSchema = await makeStateJsonSchema(scope, graphqlSchemaWithoutNewlines);
  fs.writeFileSync(`./src/state-schema.json`, jsonSchema);
  const exampleStateJson = {
    "$schema": "./state-schema.json",
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "ids": [
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001"
    ],
    "name": "test",
    "names": [
      "test1",
      "test2"
    ],
    "graphqlSchema": graphqlSchemaWithoutNewlines,
  }
  fs.writeFileSync(`./src/${scope.toLowerCase()}-state.json`, JSON.stringify(exampleStateJson, null, 2));
  const addNameInputFields: (StateSchemaPrimitiveField | StateSchemaArrayField)[] = [
    {
      type: 'primitive',
      name: 'name',
      typeName: 'string',
      nullable: false,
    },
  ]
  const addNameSchema = makeActionZodSchema(scope, 'add name', addNameInputFields);
  fs.writeFileSync(`./src/action-schemas.ts`, addNameSchema);
}

test().catch(console.error);