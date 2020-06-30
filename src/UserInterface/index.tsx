import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, combineReducers, compose } from "redux";

import App from "@/UserInterface/App";
import SubsurfaceReducer from "@/UserInterface/redux/reducers/SubsurfaceReducer";
import SubsurfaceMiddleware from "@/UserInterface/redux/middlewares/main";
import "@/UserInterface/styles/scss/theme.scss";
import { Appearance } from "@/Core/States/Appearance";
import { setCssVariable } from "@/Components/Utils";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  combineReducers({ ...SubsurfaceReducer }),
  compose(applyMiddleware(...SubsurfaceMiddleware)) // comment this line to enable redux dev tools
  //composeEnhancers(applyMiddleware(...SubsurfaceMiddleware))  // uncomment to enable redux dev tools
);

const root = document.createElement("div");
root.setAttribute("id", "root");
root.style.width = "100vw";
root.style.height = "100vh";

document.body.appendChild(root);

setCssVariable("--v-tree-icon-size", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-item-height", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-item-comp-width", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-item-bottom-margin", `${Appearance.treeItemGap}px`);
setCssVariable("--v-tree-item-indentation", `${Appearance.treeIndentation}px`);
setCssVariable("--subsurface-viz-explorer-font-size", `${Appearance.treeFontSize}px`);
setCssVariable(
  "--subsurface-viz-tree-background",
  (Appearance.treeBackgroundColor && Appearance.treeBackgroundColor.hex()) || "inherit"
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
);
