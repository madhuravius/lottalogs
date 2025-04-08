import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import LogoFull from "../assets/logo-full.png";
import { type LogEntry, useLogs } from "../contexts/LogsContext";
import { useDebounce } from "../hooks/useDebounce";
import { GithubIcon } from "./Icons";

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
      <div className="ml-4 flex items-center absolute bottom-0 right-1">
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
        <GithubIcon />
      </a>
    </div>
  );
};

export default ActionBar;
