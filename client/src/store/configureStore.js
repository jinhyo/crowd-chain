import createSagaMiddleWare from "redux-saga";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import { ETH, ethReducer } from "../features/ethSlice";
import rootSaga from "../features";
import { USER, userReducer } from "../features/userSlice";

const rootReducer = combineReducers({
  [ETH]: ethReducer,
  [USER]: userReducer,
});

const sagaMiddleWare = createSagaMiddleWare();

const store = configureStore({
  reducer: rootReducer,
  middleware: [sagaMiddleWare],
});

sagaMiddleWare.run(rootSaga);

export default store;
