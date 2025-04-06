import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";
import { LogEntry, useLogs } from "../contexts/LogsContext";

const Logs = () => {
  const { logs } = useLogs();

  const logText =
    logs
      ?.map(
        (log: LogEntry) =>
          `[${new Date(log.timestamp).toLocaleString()}] ${log.message}`,
      )
      .reverse()
      .join("\n") || "No logs found";

  return (
    <div className="flex">
      <div className="w-screen h-[calc(100vh-155px)] p-4 m-5 rounded-md shadow-[0px_0px_15px_0px_rgba(34,_197,_94,_0.5)]">
        <ScrollFollow
          startFollowing={true}
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
