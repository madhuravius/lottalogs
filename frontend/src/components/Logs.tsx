import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";
import { type Message, useLogs } from "../contexts/LogsContext";
import { ChevronDoubleDownIcon } from "./Icons";

const RESET = "[39m";
const GREEN = "[32m";
const CYAN = "[36m";

const Logs = () => {
  const {
    paused,
    setPaused,
    logs,
    wrapLines,
    isAtBottom,
    setIsAtBottom,
    setIsAtTop,
  } = useLogs();

  const logText = logs?.map
    ? logs
        ?.map(
          (log: Message) =>
            `${GREEN}${new Date(log.timestamp).toLocaleString()}${RESET} - ${CYAN}${log.index}${RESET} - ${log.message}`,
        )
        ?.reverse()
        ?.join("\n")
    : "No logs found";

  const logsGlow = paused
    ? "shadow-[0px_0px_5px_3px_rgba(255,_191,_0,_0.5)]"
    : "shadow-[0px_0px_5px_3px_rgba(34,_197,_94,_0.3)]";

  return (
    <div className={`block${wrapLines ? " wrapped-lines" : ""}`}>
      {!isAtBottom && (
        <button
          className="fixed cursor-pointer border-white-50 border-2 p-2 right-10 top-5 z-10 rounded-full"
          style={{ backgroundColor: "#222222" }}
          onClick={() => {
            const element = document.querySelector(".react-lazylog");
            if (element) {
              element.scrollTo({
                top: element.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
        >
          <ChevronDoubleDownIcon className="w-6 h-6 stroke-gray-400" />
        </button>
      )}
      <div
        className={`w-screen h-[calc(100vh-95px)] p-4 mb-3 rounded-md ${logsGlow}`}
      >
        <div className="revert-tailwind">
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
                onScroll={(scrollState) => {
                  onScroll(scrollState);
                  const { scrollTop, scrollHeight, clientHeight } = scrollState;
                  const isAtBottom =
                    scrollTop + clientHeight >= scrollHeight - 50;
                  const isAtTop = scrollTop === 0;
                  if (isAtBottom) {
                    setIsAtBottom(true);
                    setPaused(false);
                  } else if (isAtTop) {
                    setIsAtBottom(false);
                    setIsAtTop(false);
                    setPaused(false);
                  } else if (!isAtBottom) {
                    setPaused(true);
                    setIsAtBottom(false);
                  }
                }}
                selectableLines
                wrapLines={wrapLines}
                text={logText}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default Logs;
