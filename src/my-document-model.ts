import { DocumentModel, PHDocument } from "./document-model";
import { MyReducerFactory } from "./my-schemas";
import { Author, Signer } from "./stub-types";

export const myDocumentType = "oz/my-document-type";
export const myDocumentModelName = "My Document Model";
export const myDocumentModelExtension = ".ph.mine";
export const myDocumentModelAuthor: Author = {
  name: "My Name",
  email: "my@email.com",
  website: "https://my-website.com",
};
export const myDocumentModelDescription = "description etc";
export const myModuleName = "My Module";

export type Scope1State = {
  something: string;
};

export type Scope2State = {
  somethingElse: number;
}; 

export type Scope3State = {
  someNumbers: number[];
};

export type MyState = {
  scope1: Scope1State;
  scope2: Scope2State;
  scope3: Scope3State;
};

export type Action1 = {
  type: "action1";
  input: {
    something: string;
  };
  scope: "scope1";
  signer: Signer;
};

export type Action2 = {
  type: "action2";
  input: {
    somethingElse: number;
  };
  scope: "scope2";
  signer: Signer;
};

export type Action3 = {
  type: "action3";
  input: {
    someNumbers: number[];
  };
  scope: "scope3";
  signer: Signer;
};

export type MyAction = Action1 | Action2 | Action3;
export type MyActionType = MyAction["type"];
export type MyActions = Record<MyActionType, MyAction>;

export type MyReducer = (document: MyDocument, action: MyAction) => MyDocument;

export type MyDocumentModel = {
  id: string;
  documentType: string;
  name: string;
  actions: MyActions;
  reducer: MyReducer;
}

export type MyDocumentModelModule = {
  id: string;
  name: string;
  documentModel: MyDocumentModel;
  documentType: string;
  description: string;
  extension: string;
  author: Author;
}

const myState: MyState = {
  scope1: {
    something: "hello",
  },
  scope2: {
    somethingElse: 1,
  },
  scope3: {
    someNumbers: [1, 2, 3],
  },
};

const action1: Action1 = {
  type: "action1",
  input: {
    something: "hello",
  },
  scope: "scope1",
  signer: {
    address: "0x123",
    networkId: "1",
    chainId: 1,
  },
};

const action2: Action2 = {
  type: "action2",
  input: {
    somethingElse: 1,
  },
  scope: "scope2",
  signer: {
    address: "0x123",
    networkId: "1",
    chainId: 1,
  },
};

const action3: Action3 = {
  type: "action3",
  input: {
    someNumbers: [1, 2, 3],
  },
  scope: "scope3",
  signer: {
    address: "0x123",
    networkId: "1",
    chainId: 1,
  },
};

const myActions: MyActions = {
  action1,
  action2,
  action3,
};

export type MyDocument = PHDocument<MyState>;

export const myDocument: MyDocument = {
  header: {
    id: "document-1",
    name: "My Document",
    documentModelId: "document-model-1",
    documentType: myDocumentType,
    preferredEditorId: null,
  },
  state: {
    scope1: myState.scope1,
    scope2: myState.scope2,
    scope3: myState.scope3,
  },
  operations: [],
};

export const myReducer: MyReducer = MyReducerFactory.implement((document, action) => {
  switch (action.type) {
    case "action1": {
      const { something } = action.input;
      return {
        ...document,
        state: {
          ...document.state,
          scope1: {
            ...document.state.scope1,
            something,
          },
        }
      }
    }
    case "action2": {
      const { somethingElse } = action.input;
      return {
        ...document,
        state: {
          ...document.state,
          scope2: {
            ...document.state.scope2,
            somethingElse,
          },
        }
      }
    }
    case "action3": {
      const { someNumbers } = action.input;
      return {
        ...document,
        state: {
          ...document.state,
          scope3: {
            ...document.state.scope3,
            someNumbers,
          },
        }
      }
    }
    default:
      return document;
  }
});

export const myDocumentModel: DocumentModel<MyState, MyAction> = {
  id: "document-model-1",
  name: myDocumentModelName,
  documentType: myDocumentType,
  reducer: myReducer,
  actions: myActions,
};

export const myDocumentModelModule: MyDocumentModelModule = {
  id: "document-model-1",
  name: myDocumentModelName,
  documentModel: myDocumentModel,
  documentType: myDocumentType,
  description: myDocumentModelDescription,
  extension: myDocumentModelExtension,
  author: myDocumentModelAuthor,
};