import { Worksheet } from "exceljs";
import { Task } from "../types";
import { borders, dateNumberFill, smallFont, weekdayFill } from "../styles";
import { LAYOUT } from "../layout";

export function buildTimeline(worksheet: Worksheet, tasks: Task[]) {
  const sorted = [...tasks].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );
  const projectStart = sorted[0]?.startDate || new Date();
  const projectEnd = sorted[sorted.length - 1]?.endDate || new Date();

  let totalDays =
    Math.ceil((+projectEnd - +projectStart) / (1000 * 60 * 60 * 24)) + 1;
  if (totalDays % 7 !== 0) {
    totalDays += 7 - (totalDays % 7);
  }
  const END_TIMELINE = LAYOUT.TIMELINE.COL + totalDays;

  for (let i = LAYOUT.TIMELINE.COL; i < END_TIMELINE; i++) {
    const dateCell = worksheet.getCell(LAYOUT.TIMELINE.ROWS.DATE, i);
    if (i === LAYOUT.TIMELINE.COL) {
      dateCell.value = projectStart;
    } else {
      const prevCol = worksheet.getColumn(i - 1).letter;
      dateCell.value = { formula: `${prevCol}${LAYOUT.TIMELINE.ROWS.DATE}+1` };
    }

    dateCell.numFmt = "d";
    dateCell.fill = dateNumberFill;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.border = {
      top: borders.dark,
      left: borders.dark,
      right: borders.dark,
      bottom: borders.dark,
    };

    const weekdayCell = worksheet.getCell(LAYOUT.TIMELINE.ROWS.DAY, i);
    weekdayCell.value = {
      formula: `=LEFT(TEXT(${weekdayCell.col}${LAYOUT.TIMELINE.ROWS.DATE},"ddd"),1)`,
    };
    weekdayCell.fill = weekdayFill;
    weekdayCell.font = smallFont;
    weekdayCell.alignment = { horizontal: "center", vertical: "middle" };
    weekdayCell.border = {
      top: borders.dark,
      left: borders.dark,
      right: borders.dark,
      bottom: borders.dark,
    };

    worksheet.getColumn(i).width = 3;
  }

  for (let i = LAYOUT.TIMELINE.COL; i < END_TIMELINE; i += 7) {
    worksheet.mergeCells(
      LAYOUT.TIMELINE.ROWS.WEEK,
      i,
      LAYOUT.TIMELINE.ROWS.WEEK,
      Math.min(i + 6, END_TIMELINE - 1)
    );
    const weekCell = worksheet.getCell(LAYOUT.TIMELINE.ROWS.WEEK, i);
    weekCell.value = worksheet.getCell(LAYOUT.TIMELINE.ROWS.DATE, i).value;
    weekCell.numFmt = "mmmm dd, yyyy";
    weekCell.fill = weekdayFill;
    weekCell.font = smallFont;
    weekCell.alignment = { horizontal: "center", vertical: "middle" };
    weekCell.border = {
      top: borders.dark,
      left: borders.dark,
      right: borders.dark,
      bottom: borders.dark,
    };
  }

  return END_TIMELINE;
}
