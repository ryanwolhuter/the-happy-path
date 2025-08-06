import { z } from 'zod';
import { IDSchema, StringSchema, NumberSchema, BooleanSchema, DateSchema, AmountCryptoSchema } from './codegen';

export const TestStateSchema = z.object({
  id: IDSchema,
  ids: z.array(IDSchema),
  name: StringSchema.optional(),
  names: z.array(StringSchema.optional()).optional()
});

export type TestState = z.infer<typeof TestStateSchema>;
