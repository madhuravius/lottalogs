import { type ReactNode, createContext, useContext, useState } from "react";

export interface LogEntry {
  message: string;
  host: string;
  index: string;
  timestamp: string;
  id: string;
}

type LogsContextType = {
  paused: boolean;
  setPaused: (paused: boolean) => void;
  logs: LogEntry[] | null;
  setLogs: (logs: LogEntry[] | null) => void;
  wrapLines: boolean;
  setWrapLines: (wrap: boolean) => void;
};

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export const LogsProvider = ({ children }: { children: ReactNode }) => {
  const [paused, setPaused] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [wrapLines, setWrapLines] = useState<boolean>(false);

  return (
    <LogsContext.Provider
      value={{ paused, setPaused, logs, setLogs, wrapLines, setWrapLines }}
    >
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = () => {
  const context = useContext(LogsContext);
  if (!context) throw new Error("useLogs must be used within a LogsProvider");
  return context;
};
