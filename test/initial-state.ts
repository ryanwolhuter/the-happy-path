import { StateSchema } from "./state";
import { z } from "zod";

export const initialState: z.infer<typeof StateSchema> = {
  global: {
    globalStuff: [],
  },
  other: {
    id: "other",
    ids: [],
  },
};