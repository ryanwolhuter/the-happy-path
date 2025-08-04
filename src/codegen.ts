import z from "zod";
import fs from 'fs';

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

function makeStateZodSchema(scope: string, fields: (StateSchemaPrimitiveField | StateSchemaArrayField)[]) {
  const fieldSchemas = fields.map((field) => {
    switch (field.type) {
      case 'primitive':
        return makePrimitiveFieldSchema(field.name, field.typeName, field.nullable);
      case 'array':
        return makeArrayFieldSchema(field.name, field.itemType, field.nullable);
    }
  })
  return `
    import { z } from 'zod';
    import { IDSchema, StringSchema, NumberSchema, BooleanSchema, DateSchema, AmountCryptoSchema } from './codegen';

    const ${scope}StateSchema = z.object({
      ${fieldSchemas.join(',\n')}
    });

    export { ${scope}StateSchema };
  `
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

async function makeStateJsonSchema(scope: string) {
  const stateSchemaFile = await import(`./${scope}StateSchema.ts`);
  const StateSchema = stateSchemaFile[`${scope}StateSchema`];
  const jsonSchema = z.toJSONSchema(StateSchema, { io: 'input'});
  return jsonSchema;
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
  fs.writeFileSync(`./src/${scope}StateSchema.ts`, stateSchema);
  const jsonSchema = await makeStateJsonSchema(scope);
  fs.writeFileSync(`./src/${scope}StateSchema.json`, JSON.stringify(jsonSchema, null, 2));
  const graphqlSchema = makeStateGraphqlSchema(scope, testFields);
  fs.writeFileSync(`./src/${scope}StateSchema.graphql`, graphqlSchema);
}

test().catch(console.error);