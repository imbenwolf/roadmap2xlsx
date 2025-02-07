import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Readable } from "stream";
import fs from "fs";
import { parseTsv } from "./parse";
import { Project } from "./types";

// Use Jest to override fs.createReadStream so we control the TSV input.
jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs") as typeof import("fs");
  return {
    ...actualFs,
    createReadStream: jest.fn(),
  };
});

describe("parseTsv", () => {
  // A sample TSV file (using tab as separator) with a header and three rows.
  const tsvData = `Title\tURL\tAssignees\tStatus\tStart Date\tTarget Date
Task 1\thttps://github.com/owner/repoA\tAlice\tTodo\t2021-01-01T00:00:00\t2021-01-05T00:00:00
Task 2\thttps://github.com/owner/repoA\tBob\tDone\t2021-01-06T00:00:00\t2021-01-10T00:00:00
Task 3\thttps://github.com/owner/repoB\tCharlie\tIn Progress\t2021-02-01T00:00:00\t2021-02-05T00:00:00
`;

  beforeEach(() => {
    // Make createReadStream return a readable stream from our TSV string.
    (fs.createReadStream as jest.Mock).mockReturnValue(Readable.from(tsvData));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should group tasks by repository", async () => {
    const parsedProject: Project = await parseTsv("dummy-path");

    // Expect repos property to be present and an array.
    expect(parsedProject).toHaveProperty("repos");
    expect(Array.isArray(parsedProject.repos)).toBe(true);
    // In our TSV we have two distinct repos.
    expect(parsedProject.repos.length).toBe(2);

    // Verify repo names.
    const repoA = parsedProject.repos.find((r) => r.name === "owner/repoA");
    const repoB = parsedProject.repos.find((r) => r.name === "owner/repoB");
    expect(repoA).toBeDefined();
    expect(repoB).toBeDefined();

    // Verify tasks counts per repo.
    expect(repoA?.tasks.length).toBe(2);
    expect(repoB?.tasks.length).toBe(1);
  });

  it("should calculate the overall project start and end dates", async () => {
    const parsedProject: Project = await parseTsv("dummy-path");

    // The earliest start date in the TSV is "2021-01-01" and the latest end date is "2021-02-05".
    // Since the function uses new Date(row["Start Date"].split("T")[0]),
    // we compare against new Date("2021-01-01") and new Date("2021-02-05").
    const expectedStart = new Date("2021-01-01");
    const expectedEnd = new Date("2021-02-05");

    expect(parsedProject.startDate.getTime()).toBe(expectedStart.getTime());
    expect(parsedProject.endDate.getTime()).toBe(expectedEnd.getTime());
  });

  it("should parse individual task details correctly", async () => {
    const parsedProject: Project = await parseTsv("dummy-path");

    // Look at tasks from repoA.
    const repoA = parsedProject.repos.find((r) => r.name === "owner/repoA");
    expect(repoA).toBeDefined();

    const task1 = repoA?.tasks[0];
    expect(task1).toBeDefined();
    expect(task1?.title).toBe("Task 1");
    expect(task1?.url).toBe("https://github.com/owner/repoA");
    expect(task1?.assignee).toBe("Alice");
    expect(task1?.status).toBe("Todo");
    expect(task1?.startDate.getTime()).toBe(new Date("2021-01-01").getTime());
    expect(task1?.endDate.getTime()).toBe(new Date("2021-01-05").getTime());
  });

  it("should return totalDays extended to a multiple of 7", async () => {
    const parsedProject: Project = await parseTsv("dummy-path");

    // Calculate the inclusive difference in days between 2021-01-01 and 2021-02-05.
    // 2021-01-01 to 2021-02-05 is 36 days.
    // Then extend to the next multiple of 7, i.e. 42.
    const expectedTotalDays = 42;
    expect(parsedProject.totalDays).toBe(expectedTotalDays);
  });
});
