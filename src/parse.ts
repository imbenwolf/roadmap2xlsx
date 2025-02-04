import fs from "fs";
import csv from "csv-parser";
import { Task } from "./types";

export async function parseTasks(inputPath: string): Promise<Task[]> {
  const tasks: Task[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(csv({ separator: "\t" }))
      .on("data", (row) => {
        const match = row.URL?.match(/github.com\/([^\/]+\/[^\/]+)/);
        const repo = match ? match[1] : "Unknown";
        tasks.push({
          title: row.Title || "",
          url: row.URL || "",
          assignee: row.Assignees || "",
          status: row.Status || "Todo",
          startDate: new Date((row["Start Date"] || "").split("T")[0]),
          endDate: new Date((row["Target Date"] || "").split("T")[0]),
          repo,
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  return tasks;
}
