import z from "zod";
import { GlobalScopeSchema, OtherScopeSchema } from "./scopes";
import { PHIDSchema, StringSchema } from "../src/scalars";

/** used to validate the global state */
export const GlobalStateSchema = z.object({
  globalStuff: z.array(StringSchema),
});
export type GlobalState = z.infer<typeof GlobalStateSchema>;

/** used to validate the other state */
export const OtherStateSchema = z.object({
  id: PHIDSchema,
  ids: z.array(PHIDSchema),
  name: StringSchema.optional(),
  names: z.array(StringSchema.optional()).optional(),
});

export type OtherState = z.infer<typeof OtherStateSchema>;

const stateSchemasByScope = {
  global: GlobalStateSchema,
  other: OtherStateSchema,
};

/** used to validate the state with each scope */
export const StateSchema = z.object(stateSchemasByScope);
export type State = z.infer<typeof StateSchema>;