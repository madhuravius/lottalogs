import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";

const Logs = () => {
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
              extraLines={1}
              follow={follow}
              onScroll={onScroll}
              selectableLines
              wrapLines
              text={`127.0.0.1 - - [10/Oct/2023:13:55:36 +0000] "GET /index.html HTTP/1.1" 200 1024
127.0.0.1 - - [10/Oct/2023:13:55:37 +0000] "POST /api/login HTTP/1.1" 302 512
127.0.0.1 - - [10/Oct/2023:13:55:38 +0000] "GET /dashboard HTTP/1.1" 200 2048
127.0.0.1 - - [10/Oct/2023:13:55:39 +0000] "GET /static/js/app.js HTTP/1.1" 200 8192
127.0.0.1 - - [10/Oct/2023:13:55:40 +0000] "GET /static/css/style.css HTTP/1.1" 200 4096`}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Logs;
