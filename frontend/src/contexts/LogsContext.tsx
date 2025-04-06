import { createContext, ReactNode, useContext, useState } from "react";

export interface LogEntry {
  message: string;
  host: string;
  index: string;
  timestamp: string;
  id: string;
}

type LogsContextType = {
  logs: LogEntry[] | null;
  setLogs: (logs: LogEntry[] | null) => void;
  wrapLines: boolean;
  setWrapLines: (wrap: boolean) => void;
};

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export const LogsProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [wrapLines, setWrapLines] = useState<boolean>(true);

  return (
    <LogsContext.Provider value={{ logs, setLogs, wrapLines, setWrapLines }}>
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = () => {
  const context = useContext(LogsContext);
  if (!context) throw new Error("useLogs must be used within a LogsProvider");
  return context;
};
