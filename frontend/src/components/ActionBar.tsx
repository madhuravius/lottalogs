import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import LogoFull from "../assets/logo-full.png";
import { type LogEntry, useLogs } from "../contexts/LogsContext";
import { useDebounce } from "../hooks/useDebounce";

const ActionBar = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500);
  const { setLogs, wrapLines, setWrapLines } = useLogs();
  const [healthyBackend, setHealthyBackend] = useState<boolean>(true);

  useQuery({
    queryKey: ["logs", debouncedSearchText],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/logs?search_text=${encodeURIComponent(debouncedSearchText)}`,
        );
        const data: LogEntry[] = await res.json();
        setLogs(data);
        return data;
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs([]);
      }
    },
    enabled: true,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 4900,
  });

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

  return (
    <div className="flex items-center pr-4 pt-2 pl-4 bg-base-200">
      <div className="ml-4 flex items-center absolute bottom-2 right-2">
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
        <img src={LogoFull} alt="Logo" className="h-12 w-12 mb-2 rounded-md" />
        <p className="text-xs text-gray-500 text-center">Lotta Logs</p>
      </div>
      <input
        type="text"
        placeholder="Search logs..."
        className="input input-bordered w-full ml-4 input-sm"
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
        <svg
          viewBox="0 0 16 16"
          className="w-6 h-6 ml-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
    </div>
  );
};

export default ActionBar;
