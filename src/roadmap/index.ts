import { Workbook } from "exceljs";
import { parseTasks } from "../parse";
import { Task } from "../types";

import { setupHeader } from "./header";
// import { buildTimeline } from "./timeline";
// import { addRepoAndTaskRows, addLastRow } from "./tasks";
// import { applyConditionalFormatting } from "./formatting";

export async function generateRoadmap(
  inputPath: string,
  outputPath: string
): Promise<void> {
  const tasks: Task[] = await parseTasks(inputPath);

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Gantt", {
    views: [{ showGridLines: false }],
  });

  setupHeader(worksheet, tasks);
  //   const endTimeline = buildTimeline(worksheet, tasks);
  //   addRepoAndTaskRows(worksheet, tasks, endTimeline);
  //   addLastRow(worksheet, endTimeline);
  //   applyConditionalFormatting(worksheet, endTimeline);

  await workbook.xlsx.writeFile(outputPath);
}
