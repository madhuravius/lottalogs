import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http } from "msw";
import { setupServer } from "msw/node";
import ActionBar from "../components/ActionBar";
import Logs from "../components/Logs";
import { LogsProvider } from "../contexts/LogsContext";

jest.mock("@melloware/react-logviewer", () => ({
  LazyLog: ({ text }: { text: string }) => (
    <div data-testid="lazy-log">{text}</div>
  ),
  ScrollFollow: ({ render }: { render: Function }) =>
    render({ follow: true, onScroll: jest.fn() }),
}));

const server = setupServer(
  http.get("/api/logs", ({ request }) => {
    const url = new URL(request.url);
    const searchText = url.searchParams.get("search_text");

    if (searchText === "error") {
      return Response.json({
        messages: [
          {
            message: "Error in system",
            host: "host-1",
            index: "error-1",
            timestamp: "2023-01-01T00:00:00Z",
            id: "1",
          },
        ],
      });
    }

    return Response.json({
      messages: [
        {
          message: "Log message 1",
          host: "host-1",
          index: "idx-1",
          timestamp: "2023-01-01T00:00:00Z",
          id: "1",
        },
        {
          message: "Log message 2",
          host: "host-2",
          index: "idx-2",
          timestamp: "2023-01-02T00:00:00Z",
          id: "2",
        },
      ],
    });
  }),

  http.get("/api/logs/status", () => {
    return Response.json({ status: "healthy" });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Logs Feature Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const App = () => (
    <QueryClientProvider client={queryClient}>
      <LogsProvider>
        <ActionBar />
        <Logs />
      </LogsProvider>
    </QueryClientProvider>
  );

  it("loads and displays logs on initial render", async () => {
    render(<App />);

    expect(screen.getByText("No logs found")).toBeInTheDocument();

    await waitFor(() => {
      const logViewer = screen.getByTestId("lazy-log");
      expect(logViewer).toHaveTextContent("Log message");
      expect(logViewer).toHaveTextContent("idx-1");
      expect(logViewer).toHaveTextContent("idx-2");
    });
  });

  it("filters logs when searching", async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText("Search logs...");
    fireEvent.change(searchInput, { target: { value: "error" } });

    await waitFor(
      () => {
        const logViewer = screen.getByTestId("lazy-log");
        expect(logViewer).toHaveTextContent("Error in system");
        expect(logViewer).toHaveTextContent("error-1");
        expect(logViewer).not.toHaveTextContent("idx-1");
      },
      { timeout: 1000 },
    );
  });

  it("toggles wrap lines setting", async () => {
    render(<App />);

    const wrapLinesToggle = screen.getByRole("checkbox");
    fireEvent.click(wrapLinesToggle);

    expect(document.querySelector(".wrapped-lines")).toBeInTheDocument();
  });
});
