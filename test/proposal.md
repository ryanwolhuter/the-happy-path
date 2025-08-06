# Changes to the foundation

Currently, document models are expected to use graphql schemas as their source of truth. 

We want to say this: 

1. "A document model is defined by the type of it's State and the set of Actions which change its state."
2. "State is defined as an object inside a scope, Actions are defined as objects with a known `type` like "MY_ACTION" and any input payload.
3. "I can use graphql to define the type of a document model's State."
4. "I can use graphql to define the set of a document model's Actions."

We can take 1 and 2 as true by definition.

We achieve 3 like so:

```graphql
type State {
  global: {
    globalStuff: [String]
  }
  other: {
    id: ID!
    ids: [ID!]!
    name: String
    names: [String]
  }
}
```

However, for 4, we cannot achieve it with graphql.

We are expecting to be able to do this:

```graphql
# impossible

type AddNameAction {
  type: "ADD_NAME"
  scope: "global"
  input: {
    name: String
  }
}
```

We cannot have constant values like `type: "ADD_NAME"` in graphql.

The most we can do is this:

```graphql
input AddNameInput {
  name: String!
}

type AddNameAction {
  type: String
  scope: String
  input: AddNameInput!
}
```

It is impossible to use graphql alone to provide sufficient information to define the Actions which change the document model's state, because we cannot provide specific values for `type` and `scope` in graphql. 

Therefore we can conclude that 4 is false.

Therefore we can conclude that the premise that we can use graphql alone to define document models is false.

## Current workaround:

We derive this missing data using brittle and error prone means:

- scope: use the selected scope from the editor, hardcoded as 'global' or 'local'
- operation name: entered by user in textbox
- graphql input schema name: created from operation name with the form `input {PascalCaseOperationName}Input`
- graphql input schema: entered by user in code editor
- action type: created from graphql input schema name with the form `type: "CONSTANT_INPUT_NAME"`

### Pitfalls:

- graphql string parsing and schema building is error prone
- using an input name that does not exactly correspond to the operation name breaks the codegen
- we are already getting the `type` based on the operation name text input, not graphql
- determining action `type` is done without the control or knowledge of the user creating the document model, which is why our todo demo has actions with types like this: "AddTodoItemInputInput"

We are doing this because we have already acknowledged that we cannot use graphql to defined document models. 
We are already using text inputs for important fields.

### What is the alternative?

We create a simple form with text inputs and dropdowns, with a readonly code block of the graphql next to each entry.
We can already create a dropdown from the list of scalars we support.

#### To define the state:

- text input: scope
- text input: field name
tell us the name of the field you want to add to your state
- dropdown: field type, one of: PHScalars, array of PHScalar, custom type
from there we can create `myFieldName: MySelectedType`

we can then show:
```graphql
type State {
 myFieldName: MySelectedType
}
```
We can dispatch "SET_STATE_SCHEMA" operations with this.

However, it would be better to have:

"CREATE_INITIAL_STATE_SCHEMA", 
"ADD_STATE_SCHEMA_FIELD", 
"REMOVE_STATE_SCHEMA_FIELD", 
"UPDATE_STATE_SCHEMA_FIELD" 

so that we can keep track of how the state schema is changing.

#### To define the actions:

- text input: action name
- text input: action scope / just use the selected scope in editor
- text input: input field name
- dropdown: field type, one of: PHScalars, array of PHScalar, custom type
from there we can create `myFieldName: MySelectedType`

we can then show:

```graphql
"""
AddNameAction
{
  type: "ADD_NAME",
  scope: "my-scope",
  input: {
    myFieldName: MySelectedType
  }
}
"""
input AddNameInput {
  myFieldName: MySelectedType
}
```

### Summary of solution

We don't have to use difficult to handle, brittle graphql strings as our inputs when creating document models.

We can use normal objects with fields and then safely create the graphql strings from them, which is much, much easier than doing the reverse.

Doing this significantly simplifies things for both the developer and the user.

- the user can still see the graphql code
- the user can choose the scope and type when creating actions explicitly
- we can enforce that the user can only select types that work with our codegen
- we don't have to run a loop that commits the code in the editor every five seconds, even if it is invalid
- we don't need to ship a whole graphql code editor in the document model editor

## Current implementation violates the graphql spec

The following violations of the graphql spec exist in the current document model editor:

- Users cannot defined a `type Query` and `type Mutation` which are the basis of all graphql schemas
- We do not provide a means for users to define resolvers
- We do not support recursive types, see below

Last year we did a test and proved that this 

```graphql
type MyType {
  type: MyType
}
```

Does not work with our codegen. It would need to produce a lazily evaluated zod schema which references itself, https://zod.dev/api?id=recursive-objects

and we demonstrated that it does not do this.

## Summary of benefits

By using normal objects as our inputs for the document model editor operations we can still achieve the same as before, but much better and easier.

#### New features
If we know the name of a given type as selected by the user from our dropdown, we can look up the appropriate zod schema from our scalars library. We can then use these for each of the fields in a given state or action input to create a zod schema for the entire object, without ever needing to parse graphql. From these zod schemas, we can: 

- infer all of the necessary types for state and actions, including validation of action types and action scopes
- generate accurate graphql schemas to include in the document model specifications and display in the document model editor
- generate json schemas for the document model specifications so developers can have validation and autocomplete in the specification json files
- use zod's z.function().implement to create reducer functions that validate the state, action (including that the scope and type are correct) and resulting state with no extra codegen or input from builders

#### Benefits for the user
- We can still let users see graphql code if they want to
- Users who do not know graphql can also create document models just as easily
- Users who do know graphql will not be unpleasantly surprised when our editor does not behave as expected

#### Benefits for the platform
- We only dispatch operations when the user actually intends to
- We do not need to parse graphql at all, only create graphql schema from safe inputs
- We can leverage robust libraries for generating graphql schemas from our zod schemas like https://gqloom.dev/en/docs
- We can access the input data directly in the reducer, which lets us do all kinds of checks and validations etc. which are currently impossible.
