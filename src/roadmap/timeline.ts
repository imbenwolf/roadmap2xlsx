import { Style, Worksheet } from "exceljs";
import { LAYOUT } from "../config/layout";
import { alignment, borders, fill, font } from "../config/styles";

const weekStyle: Partial<Style> = {
  font: font.small,
  fill: fill.light,
  numFmt: "mmmm dd, yyyy",
  alignment: alignment.center,
  border: {
    top: borders.dark,
    left: borders.dark,
    right: borders.dark,
    bottom: borders.dark,
  },
};

const dateStyle: Partial<Style> = {
  font: font.small,
  fill: fill.dark,
  numFmt: "d",
  alignment: alignment.center,
  border: {
    top: borders.dark,
    bottom: borders.dark,
    left: borders.dark,
    right: borders.dark,
  },
};

export function buildTimeline(worksheet: Worksheet, totalDays: number): number {
  const { timeline } = LAYOUT;
  const END_TIMELINE = timeline.col + totalDays;

  for (let i = timeline.col; i < END_TIMELINE; i++) {
    // Set the daily date cell.
    const dateCell = worksheet.getCell(timeline.rows.date, i);
    dateCell.style = dateStyle;
    dateCell.value = {
      formula:
        i === timeline.col
          ? worksheet.getCell(LAYOUT.details.rows.startDate, timeline.col - 1)
              .$col$row
          : `${worksheet.getColumn(i - 1).letter}${timeline.rows.date}+1`,
    };

    // Set the daily weekday cell.
    const weekdayCell = worksheet.getCell(timeline.rows.day, i);
    weekdayCell.style = weekStyle;
    // Use the letter of the current column for the formula.
    weekdayCell.value = {
      formula: `=LEFT(TEXT(${worksheet.getColumn(i).letter}${timeline.rows.date},"ddd"),1)`,
    };

    // Set the width for the column.
    worksheet.getColumn(i).width = 3;

    // If this column marks the start of a week, set the week cell and merge cells.
    if ((i - timeline.col) % 7 === 0) {
      const weekCell = worksheet.getCell(timeline.rows.week, i);
      weekCell.style = weekStyle;
      weekCell.value = { formula: `=${dateCell.$col$row}` };
      worksheet.mergeCells(
        timeline.rows.week,
        i,
        timeline.rows.week,
        Math.min(i + 6, END_TIMELINE - 1),
      );
    }
  }

  return END_TIMELINE;
}
