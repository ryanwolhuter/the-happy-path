import { Action, DocumentModel, PHDocument, Reducer } from "./document-model";
import { DocumentModelModule, EditorModule } from "./modules";
import {
  Action1,
  Action2,
  Action3,
  MyDocument,
  myDocumentModel,
  MyDocumentModel,
  myReducer
} from "./my-document-model";
import {
  MyDocumentModelSchema,
  MyDocumentSchema
} from "./my-schemas";
import { Signer } from "./stub-types";

function useSelectedDocument() {
  return {} as PHDocument | undefined;
}

function useDocumentModelModules() {
  return [] as DocumentModelModule[];
}

function useDocumentModel(document: PHDocument | undefined) {
  const documentModelModules = useDocumentModelModules();
  const documentModelModule = documentModelModules.find(
    (module) => module.documentModel.id === document?.header.documentModelId
  );
  return documentModelModule?.documentModel;
}

function useMyDocumentModel(
  documentModel: DocumentModel | undefined
) {
  if (!isMyDocumentModel(documentModel)) return undefined;
  return documentModel;
}

function useMyDocument(
  document: PHDocument | undefined
): MyDocument | undefined {
  if (!isMyDocument(document)) return undefined;
  return document;
}

function useDispatch<TState, TAction extends Action>(
  document: PHDocument<TState> | undefined,
  reducer: Reducer<TState, TAction> | undefined
) {
  if (!document || !reducer) return undefined;
  return (action: TAction) => {
    const newDocument = reducer(document, action);
    return newDocument;
  };
}

function useEditorModules() {
  return [] as EditorModule[];
}

function useEditorModuleById(id: string | undefined): EditorModule | undefined {
  const editorModules = useEditorModules();
  return editorModules.find((module) => module.id === id);
}

export function useEditorDocumentTypes(editorModuleId: string | undefined): string[] {
  const editorModule = useEditorModuleById(editorModuleId);
  const documentModelModules = useDocumentModelModules();
  if (!editorModule) return [];
  const documentTypes = documentModelModules.filter((module) => editorModule.documentModelIds.includes(module.documentModel.id)).map((module) => module.documentType);
  return documentTypes;
}

function isMyDocument(
  document: PHDocument | undefined
): document is MyDocument {
  const result = MyDocumentSchema.safeParse(document);
  return result.success;
}

function isMyDocumentModel(
  documentModel: DocumentModel| undefined
): documentModel is MyDocumentModel {
  const result = MyDocumentModelSchema.safeParse(documentModel);
  return result.success;
}

function useSigner() {
  return {
    address: "0x123",
    networkId: "1",
    chainId: 1,
  } as Signer;
}

function MyEditor() {
  const selectedDocument = useSelectedDocument();
  const documentModel = useDocumentModel(selectedDocument);
  const myDocumentModel = useMyDocumentModel(documentModel);
  const myDocument = useMyDocument(selectedDocument);
  const myEditorModule = useEditorModuleById(myDocument?.meta?.preferredEditorId);
  const editorDocumentTypes = useEditorDocumentTypes(myEditorModule?.id);
  const signer = useSigner();
  const dispatch = useDispatch(myDocument, myReducer);

  if (!myDocumentModel || !myDocument || !dispatch) return null;

  const { state } = myDocument;
  const { scope1, scope2, scope3 } = state;
  const documentName = myDocument.header.name;
  const documentModelName = myDocumentModel.name;

  const dispatchAction1 = (action1: Action1) => {
    dispatch(action1);
  };

  const dispatchAction2 = (action2: Action2) => {
    dispatch(action2);
  };

  const dispatchAction3 = (action3: Action3) => {
    dispatch(action3);
  };

  return (
    <div>
      <h1>My Editor</h1>
      <h2>{documentName}</h2>
      <h3>{documentModelName}</h3>
      <h4>Document Types: {editorDocumentTypes.join(", ")}</h4>
      <p>scope 1 state: {scope1.something}</p>
      <p>scope 2 state: {scope2.somethingElse}</p>
      <p>scope 3 state: {scope3.someNumbers.join(", ")}</p>
      <button
        onClick={() =>
          dispatchAction1({
            type: "action1",
            input: {
              something: "hello",
            },
            scope: "scope1",
            signer,
          })
        }
      >
        Dispatch Action 1
      </button>
      <button
        onClick={() =>
          dispatchAction2({
            type: "action2",
            input: {
              somethingElse: 1,
            },
            scope: "scope2",
            signer,
          })
        }
      >
        Dispatch Action 2
      </button>
      <button
        onClick={() =>
          dispatchAction3({
            type: "action3",
            input: {
              someNumbers: [1, 2, 3],
            },
            scope: "scope3",
            signer,
          })
        }
      >
        Dispatch Action 3
      </button>
    </div>
  );
}

export const myEditorModule: EditorModule = {
  id: "my-editor-module",
  name: "My Editor",
  documentModelIds: [myDocumentModel.id, 'some-other-document-model-id'],
  editor: MyEditor,
};
