import z from "zod";

// Global scope
export const GlobalScopeSchema = z.literal("global");
// Other scope
export const OtherScopeSchema = z.literal("other");

// Union of all scopes
const scopeSchemas = [GlobalScopeSchema, OtherScopeSchema] as const;
export const ScopeSchemas = z.union(scopeSchemas);