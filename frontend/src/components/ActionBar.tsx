import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import LogoFull from "../assets/logo-full.png";
import { LogResponse, Message, useLogs } from "../contexts/LogsContext";
import { useDebounce } from "../hooks/useDebounce";
import { GithubIcon, PauseIcon, PlayIcon } from "./Icons";

const ActionBar = () => {
  const [searchText, setSearchText] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const debouncedSearchText = useDebounce(searchText, 500);
  const { paused, setPaused, logs, setLogs, wrapLines, setWrapLines, isAtTop } =
    useLogs();
  const [healthyBackend, setHealthyBackend] = useState<boolean>(true);
  const [maxTimestamp, setMaxTimestamp] = useState<string>(
    new Date().toISOString(),
  );

  useEffect(() => {
    setLogs([]);
  }, [debouncedSearchText]);

  const fetchLogData = async (): Promise<LogResponse> => {
    let url = `/api/logs?search_text=${encodeURIComponent(debouncedSearchText)}`;
    if (isAtTop) {
      const likelyMaxTimestamp =
        logs?.[logs?.length - 1]?.timestamp || maxTimestamp;
      setMaxTimestamp(likelyMaxTimestamp);
      url += `&max_timestamp=${likelyMaxTimestamp}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: LogResponse = await res.json();
    return data;
  };

  const { data } = useQuery<LogResponse, Error>({
    queryKey: ["logs", debouncedSearchText, maxTimestamp],
    queryFn: () => fetchLogData(),
    enabled: !paused,
    refetchInterval: paused ? false : 1000,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data?.messages) {
      const newMessages = data.messages;

      setLogs((prevLogs: Message[]) => {
        const currentLogs = prevLogs || [];
        const logMap = new Map<string, Message>();

        currentLogs.forEach((log: Message) => logMap.set(log.id, log));
        newMessages.forEach((log: Message) => logMap.set(log.id, log));

        const combinedLogs = Array.from(logMap.values());
        combinedLogs
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          .reverse();

        return combinedLogs;
      });

      setTotalResults(data?.total);
    }
  }, [data, setLogs, setTotalResults]);

  useQuery({
    queryKey: ["backendHealth"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/logs/status");
        if (!res.ok) throw new Error("Backend status check failed");
        const data = await res.json();
        setHealthyBackend(data?.status === "healthy");
        return data;
      } catch (error) {
        setHealthyBackend(false);
        throw error;
      }
    },
    enabled: true,
    refetchInterval: 2000,
    staleTime: 1900,
    retry: true,
  });

  const togglePauseResume = () => {
    setPaused(!paused);
  };

  return (
    <div className="flex items-center pr-4 pt-2 pl-4 bg-base-200">
      <div
        className={`fixed w-screen text-center bottom-15 overflow-hidden mb-1 p-0 text-xs ${paused ? "text-yellow-300" : "text-green-300"}`}
      >
        {paused ? (
          <span>&lt; Paused log streaming &gt;</span>
        ) : (
          <>
            <span>Streaming logs</span>
          </>
        )}
      </div>
      {!!totalResults && (
        <div className="fixed sm:hidden md:block w-screen text-left left-25 bottom-15 overflow-hidden mb-1 p-0 text-xs">
          {totalResults.toLocaleString()}
          {totalResults === 10000 ? "+" : ""} logs found.
        </div>
      )}
      <div className="ml-4 flex items-center fixed bottom-0 right-1">
        <div className="inline-grid *:[grid-area:1/1] mr-2">
          <div
            className={`status ${healthyBackend ? "status-success" : "status-error"} animate-ping`}
          />
          <div
            className={`status ${healthyBackend ? "status-success" : "status-error"}`}
          />
        </div>
        <span className="text-sm">
          {healthyBackend ? "Healthy" : "Unhealthy"}
        </span>
      </div>
      <div className="flex-shrink-0 pointer-events-none select-none">
        <img
          src={LogoFull}
          alt="Logo"
          className="h-12 w-12 ml-2 mb-2 rounded-md"
        />
        <p className="text-xs text-gray-500 text-center">Lotta Logs</p>
      </div>
      <button
        onClick={togglePauseResume}
        className={`cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ml-4 border-2 ${paused ? " border-green-300" : " border-yellow-300"}`}
        title={paused ? "Resume queries" : "Pause queries"}
      >
        {paused ? (
          <PlayIcon className="h-6 w-6 fill-green-300" />
        ) : (
          <PauseIcon className="h-6 w-6 fill-yellow-300" />
        )}
      </button>
      <input
        type="text"
        placeholder="Search logs..."
        className="input input-bordered w-full ml-2 input-sm"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div className="form-control ml-4">
        <label className="cursor-pointer label">
          <span className="label-text mr-2">Wrap Lines</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={wrapLines}
            onChange={(e) => setWrapLines(e.target.checked)}
          />
        </label>
      </div>
      <a
        href="https://github.com/madhuravius/lottalogs"
        target="_blank"
        rel="noreferrer"
      >
        <GithubIcon className={"w-6 h-6 ml-4"} />
      </a>
    </div>
  );
};

export default ActionBar;
