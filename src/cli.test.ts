import { main } from "./cli";
import { parseTsv } from "./parse";
import { generateRoadmap } from "./roadmap";
import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Project, Repo } from "./types";

// Create typed versions of our mocked functions.
const parseTsvMock = parseTsv as jest.MockedFunction<typeof parseTsv>;
const generateRoadmapMock = generateRoadmap as jest.MockedFunction<
  typeof generateRoadmap
>;

// Mock the modules that perform the heavy work.
jest.mock("./parse", () => ({
  parseTsv: jest.fn(),
}));
jest.mock("./roadmap", () => ({
  generateRoadmap: jest.fn(),
}));

// Save original process.argv and process.exit.
const originalArgv = process.argv;

describe("CLI entrypoint", () => {
  let consoleLogSpy: jest.Spied<() => void>;
  let consoleErrorSpy: jest.Spied<() => void>;
  let exitSpy: jest.Spied<() => void>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Override process.argv for each test.
    process.argv = [...originalArgv];
    // Spy on console.log and console.error.
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // Override process.exit to throw an error (so we can catch it in tests).
    exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((code?: unknown): never => {
        throw new Error(`process.exit: ${code}`);
      });
  });

  afterEach(() => {
    process.argv = originalArgv;
    exitSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should exit with error if required options are missing", async () => {
    // Simulate missing options.
    process.argv = ["node", "cli.js"];
    await expect(main()).rejects.toThrow("process.exit: 1");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error: --input and --output options are required.",
    );
  });

  it("should successfully process with valid options", async () => {
    // Simulate valid CLI arguments.
    process.argv = [
      "node",
      "cli.js",
      "--input",
      "dummy-input.tsv",
      "--output",
      "dummy-output.xlsx",
    ];

    // Create a fake project with repos typed as Repo[]
    const fakeProject: Project = {
      startDate: new Date(),
      endDate: new Date(),
      totalDays: 42,
      repos: [] as Repo[],
    };

    // Use our typed mocks.
    parseTsvMock.mockResolvedValue(fakeProject);
    generateRoadmapMock.mockResolvedValue(undefined);

    await main();

    expect(parseTsvMock).toHaveBeenCalledWith("dummy-input.tsv");
    expect(generateRoadmapMock).toHaveBeenCalledWith(
      fakeProject,
      "dummy-output.xlsx",
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Roadmap successfully saved to dummy-output.xlsx",
    );
  });

  it("should exit with error if generateRoadmap fails", async () => {
    process.argv = [
      "node",
      "cli.js",
      "--input",
      "dummy-input.tsv",
      "--output",
      "dummy-output.xlsx",
    ];

    const fakeProject: Project = {
      startDate: new Date(),
      endDate: new Date(),
      totalDays: 42,
      repos: [] as Repo[],
    };

    parseTsvMock.mockResolvedValue(fakeProject);
    const fakeError = new Error("XLSX error");
    generateRoadmapMock.mockRejectedValue(fakeError);

    await expect(main()).rejects.toThrow("process.exit: 1");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", fakeError);
  });

  it("should exit with error if parseTsv fails", async () => {
    process.argv = [
      "node",
      "cli.js",
      "--input",
      "dummy-input.tsv",
      "--output",
      "dummy-output.xlsx",
    ];

    const fakeError = new Error("TSV error");
    parseTsvMock.mockRejectedValue(fakeError);

    await expect(main()).rejects.toThrow("process.exit: 1");
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", fakeError);
  });
});
