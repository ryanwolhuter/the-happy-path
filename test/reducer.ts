import { createReducer } from "./document-model";

export const reducer = createReducer((document, action) => {
  switch (action.type) {
    case 'ADD_NAME': {
      return {
        ...document,
        state: {
          ...document.state,
          [action.scope]: {
            ...document.state[action.scope],
            names: [...(document.state[action.scope].names ?? []), action.input.name],
          }
        }
      }
    }
    case 'REMOVE_NAME': {
      return {
        ...document,
        state: {
          ...document.state,
          [action.scope]: {
            ...document.state[action.scope],
            names: document.state[action.scope].names?.filter(name => name !== action.input.name),
          }
        }
      }
    }
    case 'OTHER_ADD_NAME': {
      return {
        ...document,
        state: {
          ...document.state,
          [action.scope]: {
            ...document.state[action.scope],
            names: [...(document.state[action.scope].names ?? []), action.input.name],
          }
        }
      }
    }
    default: {
      return document;
    }
  }
})