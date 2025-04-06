import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";
import { LogEntry, useLogs } from "../contexts/LogsContext";

const RESET = "[39m";
const GREEN = "[32m";
const CYAN = "[36m";

const Logs = () => {
  const { logs, wrapLines } = useLogs();

  const logText = !!logs?.map
    ? logs
        ?.map(
          (log: LogEntry) =>
            `${GREEN}${new Date(log.timestamp).toLocaleString()}${RESET} - ${CYAN}${log.index}${RESET} - ${log.message}`,
        )
        ?.reverse()
        ?.join("\n")
    : "No logs found";

  return (
    <div className={`flex${wrapLines ? " wrapped-lines" : ""}`}>
      <div className="w-screen h-[calc(100vh-110px)] p-4 mb-3 rounded-md shadow-[0px_0px_15px_0px_rgba(34,_197,_94,_0.5)]">
        <ScrollFollow
          startFollowing
          render={({ follow, onScroll }) => (
            <LazyLog
              caseInsensitive
              enableLinks
              enableLineNumbers={false}
              enableGutters={false}
              enableHotKeys
              enableSearch={false}
              follow={follow}
              onScroll={onScroll}
              selectableLines
              wrapLines={wrapLines}
              text={logText}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Logs;
