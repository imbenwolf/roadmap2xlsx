import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Needs to be mocked before the modules that import it
const workbookMockInstance = {
  addWorksheet: jest.fn().mockReturnValue({}),
  xlsx: {
    writeFile: jest.fn().mockResolvedValue(undefined as never),
  },
};
jest.mock("exceljs", () => {
  const actualExceljs = jest.requireActual(
    "exceljs",
  ) as typeof import("exceljs");
  return {
    ...actualExceljs,
    Workbook: jest.fn().mockReturnValue(workbookMockInstance),
  };
});

import { Project, Repo } from "../types";
import { setupHeader } from "./header";
import { buildTimeline } from "./timeline";
import { addRows } from "./rows";
import { applyConditionalFormatting } from "./formatting";
import { generateRoadmap } from "./index";

jest.mock("./header", () => ({
  setupHeader: jest.fn(),
}));
jest.mock("./timeline", () => ({
  buildTimeline: jest.fn(),
}));
jest.mock("./rows", () => ({
  addRows: jest.fn(),
}));
jest.mock("./formatting", () => ({
  applyConditionalFormatting: jest.fn(),
}));

describe("generateRoadmap", () => {
  // Create a fake project.
  const fakeProject: Project = {
    startDate: new Date("2021-01-01"),
    endDate: new Date("2021-01-10"),
    totalDays: 14,
    repos: [] as Repo[],
  };

  const fakeOutputPath = "dummy-output.xlsx";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call subfunctions and write the workbook file", async () => {
    await generateRoadmap(fakeProject, fakeOutputPath);

    // Assert that each helper function was called once.
    expect(setupHeader).toHaveBeenCalledTimes(1);
    expect(buildTimeline).toHaveBeenCalledTimes(1);
    expect(addRows).toHaveBeenCalledTimes(1);
    expect(applyConditionalFormatting).toHaveBeenCalledTimes(1);

    // Assert that the helper functions were called with expected arguments.
    expect(setupHeader).toHaveBeenCalledWith(
      expect.any(Object),
      fakeProject.startDate,
      fakeProject.endDate,
    );
    expect(buildTimeline).toHaveBeenCalledWith(
      expect.any(Object),
      fakeProject.totalDays,
    );
    expect(addRows).toHaveBeenCalledWith(
      expect.any(Object),
      fakeProject.repos,
      fakeProject.totalDays,
    );
    expect(applyConditionalFormatting).toHaveBeenCalledWith(
      expect.any(Object),
      fakeProject.totalDays,
    );

    // Assert that the Workbook constructor was called.
    // (Since we have a stable instance, our mock Workbook should have been called once.)
    const { Workbook: MockedWorkbook } = await import("exceljs");
    expect(MockedWorkbook).toHaveBeenCalledTimes(1);

    // Use our stable mock instance.
    expect(workbookMockInstance.xlsx.writeFile).toBeDefined();
    expect(workbookMockInstance.xlsx.writeFile).toHaveBeenCalledWith(
      fakeOutputPath,
    );
  });
});
