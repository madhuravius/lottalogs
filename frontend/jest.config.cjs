module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/tests/mocks/styleMock.js",
    "\\.(jpg|jpeg|png|gif|ico|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/tests/mocks/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
};
