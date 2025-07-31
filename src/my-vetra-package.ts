import { myEditorModule } from "./ my-editor-module";
import { myDocumentModelModule } from "./my-document-model";
import { VetraPackage } from "./vetra";

export const myVetraPackage: VetraPackage = {
  id: "my-package-id",
  name: "My Vetra Package",
  description: "My Vetra Package",
  category: "My Category",
  author: {
    name: "My Name",
    url: "https://my-website.com",
  },
  modules: {
    documentModelModules: [
      myDocumentModelModule,
    ],
    editorModules: [
      myEditorModule,
    ],
  }
};
