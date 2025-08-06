import { z } from "zod";
import { OtherScopeSchema } from "./scopes";
import { StringSchema } from "../src/scalars";
import { BaseActionSchema } from "../src/schemas";


export const AddNameActionSchema = BaseActionSchema.extend({
  scope: OtherScopeSchema,
  type: z.literal("ADD_NAME"),
  input: z.object({
    name: StringSchema,
  }),
});

export const RemoveNameActionSchema = BaseActionSchema.extend({
  scope: OtherScopeSchema,
  type: z.literal("REMOVE_NAME"),
  input: z.object({
    name: StringSchema,
  }),
});


export const OtherAddNameActionSchema = BaseActionSchema.extend({
  scope: OtherScopeSchema,
  type: z.literal("OTHER_ADD_NAME"),
  input: z.object({
    name: StringSchema,
  }),
});
