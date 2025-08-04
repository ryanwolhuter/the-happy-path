
    import { z } from 'zod';
    import { IDSchema, StringSchema, NumberSchema, BooleanSchema, DateSchema, AmountCryptoSchema } from './codegen';

    const TestStateSchema = z.object({
      id: IDSchema,
ids: z.array(IDSchema),
name: StringSchema.optional(),
names: z.array(StringSchema.optional()).optional()
    });

    export { TestStateSchema };
  