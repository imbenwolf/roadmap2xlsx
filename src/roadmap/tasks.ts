import { Worksheet } from "exceljs";
import { Task } from "../types";
import { repoColors, borders, defaultFont } from "../styles";
import { LAYOUT } from "../layout";

export const statusProgress: Record<string, number> = {
  Todo: 0,
  "In Progress": 50,
  Done: 100,
};

export function addRepoAndTaskRows(
  worksheet: Worksheet,
  tasks: Task[],
  endTimeline: number,
) {
  let rowIndex = LAYOUT.DETAILS.ROWS.HEADER + 1;

  const repoMap = tasks.reduce((acc: Record<string, Task[]>, t) => {
    if (!acc[t.repo]) acc[t.repo] = [];
    acc[t.repo].push(t);
    return acc;
  }, {});

  let repoCount = 0;
  for (const [repoName, repoTasks] of Object.entries(repoMap)) {
    const colorSet = repoColors[repoCount % repoColors.length];
    repoCount++;

    const repoRow = worksheet.getRow(rowIndex);
    repoRow.getCell(LAYOUT.DETAILS.COL).value = repoName;
    repoRow.getCell(LAYOUT.DETAILS.COL).style = {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorSet.title },
      },
      font: { ...defaultFont, bold: true },
      alignment: { vertical: "middle" },
      border: {
        top: borders.dark,
        left: borders.dark,
        bottom: borders.dark,
      },
    };
    worksheet.mergeCells(
      rowIndex,
      LAYOUT.DETAILS.COL,
      rowIndex,
      LAYOUT.TIMELINE.COL - 1,
    );
    repoRow.height = 20;

    for (let c = LAYOUT.TIMELINE.COL; c < endTimeline; c++) {
      repoRow.getCell(c).border = {
        top: borders.dark,
        bottom: borders.dark,
        ...(c === endTimeline - 1 && { right: borders.dark }),
      };
    }

    rowIndex++;

    for (const task of repoTasks) {
      const row = worksheet.getRow(rowIndex);
      row.height = 20;
      row.alignment = { vertical: "middle" };

      row.getCell(LAYOUT.DETAILS.COL).value = `   ${
        task.title || "Untitled Task"
      }`;
      row.getCell(LAYOUT.DETAILS.COL + 1).value = task.assignee;
      row.getCell(LAYOUT.DETAILS.COL + 2).value =
        statusProgress[task.status] ?? 0;
      row.getCell(LAYOUT.DETAILS.COL + 3).value = task.startDate;
      row.getCell(LAYOUT.DETAILS.COL + 3).numFmt = "dd.mm.yyyy";
      row.getCell(LAYOUT.DETAILS.COL + 4).value = task.endDate;
      row.getCell(LAYOUT.DETAILS.COL + 4).numFmt = "dd.mm.yyyy";

      for (let col = LAYOUT.DETAILS.COL; col < LAYOUT.TIMELINE.COL; col++) {
        row.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colorSet.subtask },
        };
        if (col === LAYOUT.DETAILS.COL) {
          row.getCell(col).border = { left: borders.dark };
        }
        if (col === LAYOUT.DETAILS.COL + 2) {
          row.getCell(col).numFmt = '0"%"';
        }
      }

      for (let dayCol = LAYOUT.TIMELINE.COL; dayCol < endTimeline; dayCol++) {
        row.getCell(dayCol).border = {
          top: borders.dark,
          left: dayCol === LAYOUT.TIMELINE.COL ? borders.dark : borders.dark,
          right: dayCol === endTimeline - 1 ? borders.dark : borders.dark,
          bottom: borders.dark,
        };
      }
      rowIndex++;
    }
  }
}

export function addLastRow(worksheet: Worksheet, endTimeline: number) {
  const lastRow = worksheet.addRow([]);

  for (let col = LAYOUT.DETAILS.COL; col < endTimeline; col++) {
    lastRow.getCell(col).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F2F2F2" },
    };
    lastRow.getCell(col).border = {
      top: borders.dark,
      bottom: borders.dark,
      ...(col === LAYOUT.DETAILS.COL && { left: borders.dark }),
      ...(col === endTimeline - 1 && { right: borders.dark }),
    };
  }
}
