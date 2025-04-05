import React from "react";
import ReactDOM from "react-dom/client";
import Logs from "./components/Logs";

import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No root element found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Logs />
  </React.StrictMode>,
);
