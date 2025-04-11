import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import LogoFull from "../assets/logo-full.png";
import { LogResponse, useLogs } from "../contexts/LogsContext";
import { useDebounce } from "../hooks/useDebounce";
import { GithubIcon, PauseIcon, PlayIcon } from "./Icons";

const ActionBar = () => {
  const [searchText, setSearchText] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const debouncedSearchText = useDebounce(searchText, 500);
  const { paused, setPaused, setLogs, wrapLines, setWrapLines } = useLogs();
  const [healthyBackend, setHealthyBackend] = useState<boolean>(true);
  const [minTimestamp, setMinTimestamp] = useState<string | undefined>();
  const [maxTimestamp, setMaxTimestamp] = useState<string | undefined>();

  const fetchLogs = async () => {
    try {
      let url = `/api/logs?search_text=${encodeURIComponent(searchText)}`;
      if (minTimestamp) {
        url += `&min_timestamp=${minTimestamp}`;
      }
      const res = await fetch(url);
      const data: LogResponse = await res.json();
      setLogs(data.messages || []);
      setTotalResults(data.total);
      return data;
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    }
  };

  useQuery({
    queryKey: ["logs", debouncedSearchText],
    queryFn: () => fetchLogs(),
    enabled: false,
  });

  useEffect(() => {
    if (!paused) {
      fetchLogs();
    }

    const fetchLogsIntervalId = !paused ? setInterval(fetchLogs, 1000) : null;

    return () => {
      if (fetchLogsIntervalId) clearInterval(fetchLogsIntervalId);
    };
  }, [paused, debouncedSearchText, minTimestamp, maxTimestamp]);

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
          <span>Streaming logs...</span>
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
