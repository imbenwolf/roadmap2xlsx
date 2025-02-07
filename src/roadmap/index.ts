import { Workbook } from "exceljs";
import { Project } from "../types";

import { setupHeader } from "./header";
import { buildTimeline } from "./timeline";
import { addRows } from "./rows";
import { applyConditionalFormatting } from "./formatting";

export const generateRoadmap = async (
  project: Project,
  outputPath: string,
): Promise<void> => {
  const { startDate, endDate, totalDays, repos } = project;

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Gantt", {
    views: [{ showGridLines: false }],
  });

  setupHeader(worksheet, startDate, endDate);
  buildTimeline(worksheet, totalDays);
  addRows(worksheet, repos, totalDays);
  applyConditionalFormatting(worksheet, totalDays);

  await workbook.xlsx.writeFile(outputPath);
};
