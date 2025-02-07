import fs from "fs";
import csv from "csv-parser";
import { Task, Project } from "./types";

export async function parseTsv(inputPath: string): Promise<Project> {
  const repoMap: Record<string, Task[]> = {};

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(csv({ separator: "\t" }))
      .on("data", (row: Record<string, string>) => {
        const match = row.URL?.match(/github\.com\/([^/]+\/[^/]+)/);
        const repo = match ? match[1] : "Unknown";

        const task: Task = {
          title: row.Title || "",
          url: row.URL || "",
          assignee: row.Assignees || "",
          status: row.Status || "Todo",
          startDate: new Date(row["Start Date"].split("T")[0]),
          endDate: new Date(row["Target Date"].split("T")[0]),
        };

        if (!repoMap[repo]) {
          repoMap[repo] = [];
        }
        repoMap[repo].push(task);
      })
      .on("end", resolve)
      .on("error", reject);
  });

  const repos = Object.entries(repoMap).map(([name, tasks]) => ({
    name,
    tasks,
  }));
  const allTasks = Object.values(repoMap).flat();

  const allStartDates = allTasks
    .map((t) => t.startDate)
    .filter((d) => !isNaN(d.getTime()));
  const allEndDates = allTasks
    .map((t) => t.endDate)
    .filter((d) => !isNaN(d.getTime()));

  const startDate =
    allStartDates.length > 0
      ? new Date(Math.min(...allStartDates.map((d) => d.getTime())))
      : new Date();
  const endDate =
    allEndDates.length > 0
      ? new Date(Math.max(...allEndDates.map((d) => d.getTime())))
      : new Date();

  // Calculate totalDays as the inclusive difference in days between projectEnd and projectStart.
  let totalDays =
    Math.ceil((+endDate - +startDate) / (1000 * 60 * 60 * 24)) + 1;
  // Extend totalDays so that it becomes a multiple of 7.
  if (totalDays % 7 !== 0) {
    totalDays += 7 - (totalDays % 7);
  }

  return { startDate, endDate, totalDays, repos };
}
