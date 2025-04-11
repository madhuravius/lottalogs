import {
  Dispatch,
  type ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export interface LogResponse {
  messages: Message[];
  total: number;
}

export interface Message {
  message: string;
  host: string;
  index: string;
  timestamp: string;
  id: string;
}

type LogsContextType = {
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  logs: Message[] | null;
  setLogs: Dispatch<SetStateAction<Message[]>>;
  wrapLines: boolean;
  setWrapLines: Dispatch<SetStateAction<boolean>>;
  isAtBottom: boolean;
  setIsAtBottom: Dispatch<SetStateAction<boolean>>;
  isAtTop: boolean;
  setIsAtTop: Dispatch<SetStateAction<boolean>>;
};

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export const LogsProvider = ({ children }: { children: ReactNode }) => {
  const [paused, setPaused] = useState<boolean>(false);
  const [isAtTop, setIsAtTop] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [logs, setLogs] = useState<Message[]>([]);
  const [wrapLines, setWrapLines] = useState<boolean>(false);

  return (
    <LogsContext.Provider
      value={{
        paused,
        setPaused,
        logs,
        setLogs,
        wrapLines,
        setWrapLines,
        setIsAtBottom,
        isAtBottom,
        isAtTop,
        setIsAtTop,
      }}
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
