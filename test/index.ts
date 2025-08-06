import { isActionOfType, isDocumentModelOfType, isDocumentOfType } from "./validators";

import type { TDocumentModel as MyDocumentModel } from "./document-model";
import type { TDocument as MyDocument } from "./document-model";
export type { MyDocumentModel };
export type { MyDocument };

  import type { TActions as MyActions } from "./document-model";
export type { MyActions };

export { reducer as myReducer } from "./reducer";
export { initialState as myInitialState } from "./initial-state";

export const isMyDocumentModel = isDocumentModelOfType<MyDocumentModel>;
export const isMyDocument = isDocumentOfType<MyDocument>;
export const isMyAction = isActionOfType<MyActions>;