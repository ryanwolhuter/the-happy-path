import { z } from 'zod';
import { IDSchema, StringSchema, NumberSchema, BooleanSchema, DateSchema, AmountCryptoSchema } from './codegen';

export const AddNameActionInputSchema = z.object({
  name: StringSchema
});
export const AddNameActionSchema = z.object({
    scope: z.literal('test'),
    type: z.literal('ADD_NAME'),
    input: z.object({
  name: StringSchema
}),
  });

export type AddNameActionInput = z.infer<typeof AddNameActionInputSchema>;
export type AddNameAction = z.infer<typeof AddNameActionSchema>;

export const actionSchemas = [
  AddNameActionSchema,
] as const;

export const ActionSchemasSchema = z.union(actionSchemas);
export type ActionSchemas = z.infer<typeof ActionSchemasSchema>;