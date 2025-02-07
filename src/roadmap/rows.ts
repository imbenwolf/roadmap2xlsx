import { Row, Worksheet } from "exceljs";
import { Repo, Task } from "../types";
import { borders, font, alignment, fill } from "../config/styles";
import { CELL_HEIGHT, LAYOUT } from "../config/layout";
import { COLORS } from "../config/colors";

export const statusProgress: Record<string, number> = {
  Todo: 0,
  "In Progress": 50,
  Done: 100,
};

const { details, timeline } = LAYOUT;

function applyTimelineBorders(row: Row, endTimeline: number): void {
  const isRepoRow = row.getCell(details.col).isMerged;
  for (let col = timeline.col; col < endTimeline; col++) {
    row.getCell(col).border = {
      top: isRepoRow ? borders.dark : borders.light,
      bottom: isRepoRow ? borders.dark : borders.light,
      left: isRepoRow
        ? undefined
        : col === timeline.col
          ? borders.dark
          : borders.light,
      right:
        col === endTimeline - 1
          ? borders.dark
          : isRepoRow
            ? undefined
            : borders.light,
    };
  }
}

function addRepoRow(
  worksheet: Worksheet,
  repoName: string,
  fillColor: string,
  endTimeline: number,
): void {
  const row = worksheet.addRow([]);
  const cell = row.getCell(details.col);
  cell.value = repoName;
  cell.style = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } },
    font: { ...font.normal, bold: true },
    alignment: alignment.left,
    border: { top: borders.dark, left: borders.dark, bottom: borders.dark },
  };
  worksheet.mergeCells(row.number, details.col, row.number, timeline.col - 1);
  row.height = CELL_HEIGHT;
  applyTimelineBorders(row, endTimeline);
}

function addTaskRow(
  worksheet: Worksheet,
  task: Task,
  fillColor: string,
  endTimeline: number,
): void {
  const row = worksheet.addRow([]);
  row.height = CELL_HEIGHT;
  row.alignment = { vertical: "middle" };

  row.getCell(details.col).value = `   ${task.title || "Untitled Task"}`;
  row.getCell(details.col + 1).value = task.assignee;
  row.getCell(details.col + 2).value = statusProgress[task.status] ?? 0;

  const startCell = row.getCell(details.col + 3);
  startCell.value = task.startDate;
  startCell.numFmt = "dd.mm.yyyy";

  const endCell = row.getCell(details.col + 4);
  endCell.value = task.endDate;
  endCell.numFmt = "dd.mm.yyyy";

  for (let col = details.col; col < timeline.col; col++) {
    const cell = row.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: fillColor },
    };
    if (col === details.col) cell.border = { left: borders.dark };
    if (col === details.col + 2) cell.numFmt = '0"%"';
  }
  applyTimelineBorders(row, endTimeline);
}

function addLastRow(worksheet: Worksheet, endTimeline: number): void {
  const row = worksheet.addRow([]);
  for (let col = details.col; col < endTimeline; col++) {
    const cell = row.getCell(col);
    cell.style = {
      fill: fill.light,
      border: {
        top: borders.dark,
        bottom: borders.dark,
        ...(col === details.col && { left: borders.dark }),
        ...(col === endTimeline - 1 && { right: borders.dark }),
      },
    };
    cell.fill = fill.light;
    cell.border = {
      top: borders.dark,
      bottom: borders.dark,
      ...(col === details.col && { left: borders.dark }),
      ...(col === endTimeline - 1 && { right: borders.dark }),
    };
  }
}

export function addRows(
  worksheet: Worksheet,
  repos: Repo[],
  totalDays: number,
): void {
  const endTimeline = timeline.col + totalDays;
  repos.forEach(({ name, tasks }, index) => {
    const [titleColor, taskColor] = COLORS.repos[index % COLORS.repos.length];
    addRepoRow(worksheet, name, titleColor, endTimeline);
    tasks.forEach((task) =>
      addTaskRow(worksheet, task, taskColor, endTimeline),
    );
  });
  addLastRow(worksheet, endTimeline);
}
