import { z } from "zod";

export const PHIDSchema = z.string().min(1);
export const OIDSchema = z.string().min(1);
export const StringSchema = z.string().min(1);
export const NumberSchema = z.number();
export const BooleanSchema = z.boolean();
export const DateSchema = z.date();

export const AmountCryptoSchema = z.object({
  amount: NumberSchema,
  currency: StringSchema,
});

export const scalars = {
  id: {
    schema: PHIDSchema,
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

export type ScalarName = keyof typeof scalars;
export const scalarNames = Object.keys(scalars) as ScalarName[];