import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import ActionBar from "./components/ActionBar";
import Logs from "./components/Logs";
import { LogsProvider } from "./contexts/LogsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const root = document.getElementById("root");

if (!root) {
  throw new Error("No root element found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LogsProvider>
        <Logs />
        <ActionBar />
      </LogsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
