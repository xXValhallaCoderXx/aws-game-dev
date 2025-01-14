import "./shared/styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

import { store } from "./shared/services/redux-store.service.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);


Amplify.configure(outputs);