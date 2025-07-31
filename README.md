
## We need ids

For any item that could conceivably appear in a list of similar items, that item must have a unique and immutable id.

The id must be created once and never changed. Generating an id is a cheap and easy operation. We can do this with a function that we keep in one location in our codebase, so that if we decide to change how ids are created later we can make that update in one place.

To upgrade all of our document models, modules etc to have an id is an extremely easy codemod. All we need to do is read the json file, create the id string, and then add that to the json.

Currently there are two major problems relating to identifying document models and editors.

For document models, we have a field called id, but this is really the document type. This is a major problem because:

- This field is determined by user input when creating a document model, so we have no way of enforcing uniqueness.
- The "document type" input field is always present in the document model editor, which implies that a user can change it whenever they want. But if a user does this, it will break every document which uses that document model, since they will now have an incorrect id.

For editors, we have an id field inside of a config field in an editor module.

- this does not make sense, because "config" implies that this can be changed by the user, which again makes the id become unusable as a unique identifier.
- having the id in a different place in the object means that we can't use the same logic for finding the id as we would use for other types of modules. This means it needs special logic that needs to be maintained for no benefit.

"document type" should just be a piece of metadata to show in the ui for the convenience of users. It should not determine our business logic.

Say for example I create an editor and say it works for "my-document-type", which corresponds to a document model I created. Then someone changes the document type field in the document model editor to be "my-other-document-type". We then need an automated process to go and check all of the editors which had "my-document-type" and update it to "my-other-document-type". Now lets imagine that this document type is for a document model that lives in an external package. If they change the document type in that package, then how will my editor even know that it needs to change?

If we simply have a "documentModelIds" array in an editor module, then we can find the document models for a given editor by id. We can show the document types as strings by having a separate "documentType" field in a document model. this way we can always show the correct document type name, and changing the document type does not break the editors.

## utils without utility

In the DocumentModelModule type, we have this "utils" field. This field contains a ton of stuff that needs to be created by our codegen, but it actually does nothing useful. Instead of spending hours fixing the codegen for this, we could just delete it. We are also putting this utils object in every document model, which we need to load in the app. If we are concerned about bundle size and performance, why would we want to include all of this duplicated bloat in every model that needs to be loaded?

Here is the utils code generated for my todo demo project:

```ts
const utils: DocumentModelUtils<ToDoDocument> = {
  fileExtension: ".phdm",
  createState(state) {
    return {
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createExtendedState(extendedState) {
    return baseCreateExtendedState({ ...extendedState }, utils.createState);
  },
  createDocument(state) {
    const document = baseCreateDocument(
      utils.createExtendedState(state),
      utils.createState,
    );

    document.header.documentType = "powerhouse/todo";

    // for backwards compatibility, but this is NOT a valid signed document id
    document.header.id = generateId();

    return document;
  },
  saveToFile(document, path, name) {
    return baseSaveToFile(document, path, ".phdm", name);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromFile(path) {
    return baseLoadFromFile(path, reducer);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
  },
};
```

None of this needs to be generated in a project.

`fileExtension: ".phdm",` — this is already defined in the document model and does not need to be a string living in the code.

```ts
createState(state) {
    return {
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
```

— this function could just live in the document-model package, it does nothing special for a given project

```ts
  createExtendedState(extendedState) {
    return baseCreateExtendedState({ ...extendedState }, utils.createState);
  },
  ```

— this does nothing but call the above function along with the base function from the document-model package. It is redundant.

```ts
createDocument(state) {
    const document = baseCreateDocument(
      utils.createExtendedState(state),
      utils.createState,
    );

    document.header.documentType = "powerhouse/todo";

    // for backwards compatibility, but this is NOT a valid signed document id
    document.header.id = generateId();

    return document;
  },
```

— this just calls a function from the document model, and adds the document type and creates an id. There is no reason we could not just call the base function and pass the other parts as arguments.

```ts
saveToFile(document, path, name) {
    return baseSaveToFile(document, path, ".phdm", name);
  },
  ```

— this also just calls the base function with a value that should have been derived from the document model.

```ts
saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  ```

— this literally does nothing, it just calls the function from the document-model package.

```ts
loadFromFile(path) {
    return baseLoadFromFile(path, reducer);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
  },
  ```

  these just call the base functions with the reducer, which also can and should just be derived from the document model.

## Generics that lie

  Then when we look at those base functions, they are actually very problematic. This is the code as it stands now:

```ts
/**
 * Important note: it is the responsibility of the caller to set the document type
 * on the header.
 */
export function baseCreateDocument<TDocument extends PHDocument>(
  initialState?: Partial<ExtendedStateFromDocument<TDocument>>,
  createState?: CreateState<TDocument>,
): TDocument {
  const state: ExtendedStateFromDocument<TDocument> = baseCreateExtendedState(
    initialState,
    createState,
  );

  const header = createUnsignedHeader();
  return {
    ...state,
    header,
    initialState: state,
    operations: { global: [], local: [] },
    clipboard: [],
    attachments: {},
  } as unknown as TDocument;
}
```

We see that there is a comment saying that the caller must set the document type. Why though? surely we can just take the document type as an argument?

Then when we look at the result:

```ts
  return {
    ...state,
    header,
    initialState: state,
    operations: { global: [], local: [] },
    clipboard: [],
    attachments: {},
  } as unknown as TDocument; // <--- we are lying about the return value
  ```

We are going to all of this effort to pass along generics, but then when the generics tell us that the type we are returning is wrong, we just disable typescript with the as unknown as cast. We are not doing any validation to check that the document we have created is correct, and we are also telling our users that they don't need to validate either because the type returned is "correct" according to us.

We are already going to so much trouble to generate zod schemas for validate things like this, but then we are telling the users not to bother with validation because the type is already asserted to be correct.

We have this deep and insanely complicated web of generics for the sake of "knowing" the types of the data we are working with, but at the base level we are deliberately opting out of this type safety. For example in the document-model document model, this is what we export for the actions:

```ts
export const actions = {
  setName,
  undo,
  redo,
  prune,
  loadState,
  noop,
} as unknown as Record<string, (input: any) => DefaultAction>;
// TODO improve base actions type
```

removing the as unknown shows that this type does not conform, but we are saying that it actually does. this cascades all the way down to everything that uses the document model document model.

## our reducers don't work like normal reducers

This is the typical type signature for a reducer, I got this one from React.

`type Reducer<S, A> = (prevState: S, action: A) => S;`

A reducer takes a state and an action and returns a state. 

We have far too many different definitions for reducers (document reducer, state reducer etc.). And the one we ultimately ship when generating code for a project has this signature:

```ts
type StateReducer<TDocument extends PHDocument> = <TAction extends ActionFromDocument<TDocument>>(state: Draft<BaseStateFromDocument<TDocument>>, action: TAction | DefaultAction | Operation<TAction>, dispatch?: SignalDispatch) => BaseStateFromDocument<TDocument> | undefined
```

to simplify, we have this

`type Reducer<State> = <Action>(state: State, action: Action, dispatch: SignalDispatch) => State | undefined`

this is wrong for several reasons:

1. our reducer expects a dispatch function as an argument. This is not how reducers are meant to work. Normally a dispatch function calls the reducer. Here we are giving a dispatch function to the reducer which then calls the dispatch function.

2. Our reducer can return undefined even when given a defined state. This violates the contract of reducers.

3. We are providing a type for the document (state) and action, but the reducer also works on various other actions that are outside of the actions we pass in.

4. Because we actually allow many other actions, our generic for the action needs to be assigned to the function type instead of the reducer type, since we expect to infer the action type from types outside of our state definition.

Our reducer definition should look like this

`type Reducer<TState, TAction extends Action>= (document: PHDocument<TState>, action: TAction) => PHDocument<TState>;`

1. The state a reducer operates on should be defined in the project and be known to the developer

2. All of the actions a reducer accepts should also be defined in the project. For default actions that all documents support like SET_NAME etc, we should include them in the union of actions in a project so that developers can see them and know what they are and how they work.

3. The reducer should take the whole document instead of just the document's state field, because there are potentially many other things in the document object which reducer business logic might want to work with.

4. For any given document, the reducer should always return a document of the same type. If we can't figure out what to do in a reducer, we should just return the original document unchanged.

## doing way, way too much work with schemas and types

We are doing a significant amount of redundant work in our codegen for the types and schemas we make for a given document model.

let's look at what we generate for the "add todo item" operation in my todo demo project. 

After adding the input type in the graphql for this operation, we generate all of this, most of it in separate files which all need their own templates:

```ts
export type AddTodoItemInputInput = {
  id: Scalars["ID"]["input"];
  text: Scalars["String"]["input"];
};
```

```ts
export function AddTodoItemInputInputSchema(): z.ZodObject<
  Properties<AddTodoItemInputInput>
> {
  return z.object({
    id: z.string(),
    text: z.string(),
  });
}
```

```ts
export type AddTodoItemInputAction = BaseAction<
  "ADD_TODO_ITEM_INPUT",
  AddTodoItemInputInput,
  "global"
>;
```

```ts
export const addTodoItemInput = (input: AddTodoItemInputInput) =>
  createAction<AddTodoItemInputAction>(
    "ADD_TODO_ITEM_INPUT",
    { ...input },
    undefined,
    z.AddTodoItemInputInputSchema,
    "global",
  );
```

```ts
export default class ToDo_BaseOperations extends BaseDocumentClass<
  ToDoState,
  ToDoLocalState,
  ToDoAction
> {
  public addTodoItemInput(input: AddTodoItemInputInput) {
    return this.dispatch(addTodoItemInput(input));
  }
  ```

```ts
export interface ToDoBaseOperationsOperations {
  addTodoItemInputOperation: (
    state: ToDoState,
    action: AddTodoItemInputAction,
    dispatch?: SignalDispatch,
  ) => void;
```

```json
  operations: [
            {
              id: "qLzJqfXLBcQwkmARZYVtvzslS9M=",
              name: "ADD_TODO_ITEM_INPUT",
              description: "",
              schema:
                "input AddTodoItemInputInput {\n  id: ID!\n  text: String!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
```

```ts
const stateReducer: StateReducer<ToDoDocument> = (state, action, dispatch) => {
  if (isDocumentAction(action)) {
    return state;
  }

  switch (action.type) {
    case "ADD_TODO_ITEM_INPUT":
      z.AddTodoItemInputInputSchema().parse(action.input);
      BaseOperationsReducer.addTodoItemInputOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;
```

```ts
export const reducer: ToDoBaseOperationsOperations = {
  addTodoItemInputOperation(state, action, dispatch) {
    state.stats.total += 1;
    state.stats.unchecked += 1;
    state.items.push({
        id: action.input.id,
        text: action.input.text,
        checked: false,
    });
  },
```

```ts
  it("should handle addTodoItemInput operation", () => {
    const input: AddTodoItemInputInput = generateMock(
      z.AddTodoItemInputInputSchema(),
    );

    const updatedDocument = reducer(document, creators.addTodoItemInput(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe(
      "ADD_TODO_ITEM_INPUT",
    );
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle updateTodoItemInput operation", () => {
    const input: UpdateTodoItemInputInput = generateMock(
      z.UpdateTodoItemInputInputSchema(),
    );

    const updatedDocument = reducer(
      document,
      creators.updateTodoItemInput(input),
    );

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe(
      "UPDATE_TODO_ITEM_INPUT",
    );
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  ```

  clearly this in an insane amount of code to do something this simple. And the worst part is that we _still_ don't have some of the things we actually need to do this properly. Ideally we would want to have a zod schema that validates the whole action, not just the input. And looking at the test code, all we are testing is that the reducer added an operation to the document. We are essentially just testing zod's parsing (which we know is working) and then not testing if the new document is actually changed in the way we want.

So how can we simplify this?

Firstly, since we are generating zod schemas, we should use them.

We don't need "creators" for our actions at all. The creators just do this:

```ts
export function createAction<TAction extends BaseAction<string, unknown>>(
  type: TAction["type"],
  input?: TAction["input"],
  attachments?: TAction["attachments"],
  validator?: () => { parse(v: unknown): TAction["input"] },
  scope: OperationScope = "global",
): TAction {
  if (!type) {
    throw new Error("Empty action type");
  }

  if (typeof type !== "string") {
    throw new Error(`Invalid action type: ${JSON.stringify(type)}`);
  }

  const action: BaseAction<string, unknown> = {
    type,
    input,
    scope,
  };

  if (attachments) {
    action.attachments = attachments;
  }

  try {
    validator?.().parse(action.input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InvalidActionInputZodError(error.issues);
    } else {
      throw new InvalidActionInputError(error);
    }
  }

  return action as TAction;
}
```

it is essentially just calling the zod validator and rethrowing the errors. this is redundant.

Instead of generating this type,

```ts
export type AddTodoItemInputAction = BaseAction<
  "ADD_TODO_ITEM_INPUT",
  AddTodoItemInputInput,
  "global"
>;
```

we can create a zod schema for the action:

```ts
const AddTodoActionSchema = ActionSchema.extend({
  type: "ADD_TODO_ITEM_INPUT",
  input: AddTodoItemInputSchema,
  scope: "global"
});
```

then we can generate a type definition for the action from here:

```ts
type AddTodoAction = z.infer<typeof AddTodoActionSchema>
```

and the set of actions for a document model can be a union of these:

```ts
const TodoActionSchema = z.union([AddTodoActionSchema, OtherTodoActionSchema])

type TodoAction = z.infer<TodoActionSchema>
```

then for the reducer, we are already generating a zod schema for the state defined in graphql 

```ts
export function ToDoStateSchema(): z.ZodObject<Properties<ToDoState>> {
  return z.object({
    __typename: z.literal("ToDoState").optional(),
    items: z.array(ToDoItemSchema()),
    stats: ToDoListStatsSchema(),
  });
}
```

so we can go a bit further and create a zod schema for a document:

```ts
export const TodoDocumentSchema = z.object({
  header: HeaderSchema,
  state: TodoStateSchema,
  operations: OperationsSchema,
});
```

then zod lets us define a function factory which validates both inputs and outputs like so:

```ts
https://zod.dev/api?id=functions
export const ReducerFunctionFactory = z.function({
  input: [TodoDocumentSchema, TodoActionSchema],
  output: TodoDocumentSchema,
})

const reducer = ReducerFunctionFactory.implement((document, action) => {
  // this new function automatically validates the inputs and outputs and infers the type, with no need for type args or generics
  // at this point we already know that document is of type TodoDocument and action is of type TodoAction

  switch (action.type) {
    case "ADD_TODO_ITEM_INPUT":
      // we already validated the whole action against our schema, and now zod knows to validate the input field based on the specific action type too
      const { item, stats } = input;
      return document;
    
    default: return document;
  }

  // since we have a default case in the switch statement, adding more action schemas does not break the current implementation. If we add a new input, it will add a new input schema, so we can generate a new derived action schema. then its just a matter of adding another case to the switch block, and the input is already validated.
})
```

By leveraging these zod schemas, we no longer need all of these as unknown as because we are actually validating our code and making sure that our types really are correct. We no longer need chains of generics because we can always just receive the basic type, parse it and then proceed with the more specific type.