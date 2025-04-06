import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";
import { LogEntry, useLogs } from "../contexts/LogsContext";

const Logs = () => {
  const logs = useLogs();

  const logText =
    logs?.logs
      ?.map(
        (log: LogEntry) =>
          `[${new Date(log.timestamp).toLocaleString()}] ${log.message}`,
      )
      .join("\n") || "No logs found";
  console.log(logs?.logs, logText);

  return (
    <div className="flex">
      <div className="w-screen h-[calc(100vh-150px)] m-4 rounded-md">
        <ScrollFollow
          startFollowing={true}
          render={({ follow, onScroll }) => (
            <LazyLog
              caseInsensitive
              enableGutters
              enableHotKeys
              enableSearch={false}
              follow={follow}
              onScroll={onScroll}
              selectableLines
              wrapLines
              text={logText}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Logs;
