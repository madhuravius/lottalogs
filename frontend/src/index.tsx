import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import ActionBar from "./components/ActionBar";
import Logs from "./components/Logs";
import { LogsProvider } from "./contexts/LogsContext";

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hour cache
    },
  },
});

const persistOptions = {
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

const root = document.getElementById("root");

if (!root) {
  throw new Error("No root element found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <LogsProvider>
        <div className="overscroll-none">
          <Logs />
          <ActionBar />
        </div>
      </LogsProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
