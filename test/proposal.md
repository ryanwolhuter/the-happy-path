# Changes to the foundation

What is a document model? what is it's source of truth? Is it a graphql schema? Is it a json file? Is it data in a server? 

We have ended up in a situation where it is some awkward combination of all of the above.

We have chosen to use graphql to define document models on the assumption that "analysts are familiar with it". I will challenge this assumption later, but for now let's assume it to be true.

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

This is also why you will not find tools for creating things like zod schemas from graphql. There simply is no point.

How do we get this missing information today?

We very, very awkwardly try to gather it by looking at the selected scope in the editor for the scope, then we use the name of the operation which is just entered through a normal text input (not graphql) to generate the name of the graphql input type, and then we dispatch operations to "SET_OPERATION_SCHEMA" which contain the graphql input type, and then we read the name of that graphql input type and guess at an appropriate name of the action. All of this happens without the control or knowledge of the user creating the document model, which is why our todo demo has actions with names like this: "AddTodoItemInputInput".

By doing this, we have already acknowledged that we cannot use graphql to defined document models. We are already using text inputs for important fields.

What is the alternative?

We have said that "analysts are more familiar with graphql". 
More familiar with it than what? With text inputs and dropdowns?
Surely there is no person alive who is more familiar with writing graphql than they are with clicking buttons.

There are plenty of great tools for doing the reverse of what we are currently doing, i.e. taking zod schemas and creating graphql schemas from them. This is easy because we are going from more information to less.

Like this one for example: https://gqloom.dev/en/docs

My alternative here is to create just a simple form.

We can already create a dropdown from the list of scalars we support.

To define the state:

- text input: scope
then we can dispatch an operation "SET_STATE_SCHEMA" with no fields and create this
```graphql
type State {}
```
and we can show this in a read-only code block next to the inputs
- text input: field name
tell us the name of the field you want to add to your state
- dropdown: field type, one of: PHScalars, array of PHScalar, custom type
from there we can create `myFieldName: MySelectedType`
We can then dispatch another "SET_STATE_SCHEMA" operation, but really it makes no sense that we can only use this one operation. We should actually have "CREATE_INITIAL_STATE_SCHEMA", "ADD_STATE_SCHEMA_FIELD", "REMOVE_STATE_SCHEMA_FIELD", "UPDATE_STATE_SCHEMA_FIELD" so that we can actually keep track of how the state schema is changing.

then for actions:
- text input: action name
then we can dispatch an operation "SET_STATE_SCHEMA" with no fields and create this
```graphql
input ActionNameInput {}
```
- text input: action scope / just use the selected scope in editor
the next part is identical to above:
- text input: field name
tell us the name of the field you want to add to your state
- dropdown: field type, one of: PHScalars, array of PHScalar, custom type
from there we can create `myFieldName: MySelectedType`

The key point is this:

We don't have to use difficult to handle, brittle graphql strings as our inputs when creating document models. We can use normal objects with fields and then safely create the graphql strings from them, which is much, much easier than doing the reverse.

Doing this significantly simplifies things for both the developer and the user.

- the user can still see the graphql code
- the user can actually control things like names and scopes for actions
- we can enforce that the user uses only things that our codegen actually can use
- we don't have to run a loop that commits whatever is in the editor every five seconds, even if it is not valid code
- we don't need to ship a whole graphql code editor in the document model editor
- we can use the inputs to these operations to create the actions without needing to try and guess half the critical data by reading graphql strings

As things are now, it is totally possible that a remote user is editing the document model that I am also working on, and then the loop that we have running which just dispatches the "SET_SCHEMA" operation runs before they are done typing, which commits invalid code, and breaks the document model on my machine. 

We have said that we don't want to violate the graphql spec. Unfortunately we are already significantly violating the graphql spec:

- Users cannot defined a `type Query` and `type Mutation` which are the basis of all graphql schemas
- We do not provide a means for users to define resolvers themselves
- We do not support recursive types. Last year we did a test and proved that this 

```graphql
type MyType {
  type: MyType
}
```

Does not work with our codegen. It would need to produce a lazily evaluated zod schema which references itself, https://zod.dev/api?id=recursive-objects

and we demonstrated that it does not do this.

By using normal objects as our inputs for the document model editor operations we can still achieve the same as before, but much better and easier.

We can still let users see graphql code if they want to
Users who do not know graphql can also create document models just as easily
Users who do know graphql will not be unpleasantly surprised when our editor does not behave as expected
We only dispatch operations when the user actually intends to
We do not need to parse graphql at all, only create from safe inputs
We can access the input data directly in the reducer, which lets us do all kinds of checks and validations etc. which are currently impossible.
