import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import ActionBar from "./components/ActionBar";
import Logs from "./components/Logs";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No root element found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ActionBar />
    <Logs />
  </React.StrictMode>,
);
