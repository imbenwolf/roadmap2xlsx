import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Worksheet } from "exceljs";
import { buildTimeline } from "./timeline";
import { LAYOUT } from "../config/layout";
import { borders, fill, font, alignment } from "../config/styles";
import { Row } from "exceljs";
import { Cell } from "exceljs";
import { Column } from "exceljs";

// Destructure needed parts from LAYOUT.
const { timeline, details } = LAYOUT;

// Create a fake worksheet with minimal behavior.
interface FakeRow extends Row {
  cells: Record<number, Cell>;
}
interface FakeWorksheet extends Partial<Worksheet> {
  rows: Partial<FakeRow>[];
  columns: Partial<Column>[];
  getRow: (row: number) => FakeRow;
  getColumn: (col: number) => Column;
  mergeCells: jest.Mock;
  getCell: (row: number, col: number) => Cell;
}

describe("buildTimeline", () => {
  let worksheet: FakeWorksheet;

  beforeEach(() => {
    const rows: FakeRow[] = [];
    const columns: Column[] = [];

    // Minimal implementation for getRow: returns a row object with a getCell method.
    const getRow = jest.fn((rowNumber: number) => {
      if (!rows[rowNumber]) {
        rows[rowNumber] = {
          number: rowNumber,
          height: 0,
          cells: {} as Record<number, Cell>,
          getCell: jest.fn((col: number) => {
            if (!rows[rowNumber].cells![col]) {
              rows[rowNumber].cells![col] = {} as Cell;
            }
            return rows[rowNumber].cells![col];
          }),
        } as unknown as Row & { cells: Record<number, Cell> };
      }
      return rows[rowNumber];
    });

    // Minimal implementation for getColumn.
    const getColumn = jest.fn((colNumber: number) => {
      if (!columns[colNumber]) {
        columns[colNumber] = { number: colNumber, width: 0 } as Column;
      }
      return columns[colNumber];
    });

    // A helper for getCell that uses row and col.
    const getCell = (row: number, col: number) => {
      return getRow(row).getCell!(col);
    };

    worksheet = {
      rows,
      columns,
      getRow,
      getColumn,
      mergeCells: jest.fn(),
      getCell,
    };

    // Simulate the "start date" cell that buildTimeline uses for its first formula.
    const startDateCell = worksheet.getCell(
      details.rows.startDate,
      timeline.col - 1,
    );
    startDateCell.$col$row = "X1"; // Arbitrary test value.
  });

  it("should return END_TIMELINE equal to timeline.col + totalDays", () => {
    const totalDays = 14; // Example totalDays.
    const END_TIMELINE = buildTimeline(
      worksheet as unknown as Worksheet,
      totalDays,
    );
    expect(END_TIMELINE).toBe(timeline.col + totalDays);
  });

  it("should set daily date cells with proper style, value, and column width", () => {
    const totalDays = 7;
    const END_TIMELINE = buildTimeline(
      worksheet as unknown as Worksheet,
      totalDays,
    );

    // Expected dateStyle values.
    const expectedDateFont = font.small;
    const expectedDateFill = fill.dark;
    const expectedDateAlignment = alignment.center;
    const expectedDateNumFmt = "d";
    const expectedDateBorder = {
      top: borders.dark,
      bottom: borders.dark,
      left: borders.dark,
      right: borders.dark,
    };

    for (let i = timeline.col; i < END_TIMELINE; i++) {
      const dateCell = worksheet.getCell(timeline.rows.date, i);
      // Check style properties.
      expect(dateCell.style.font).toEqual(expectedDateFont);
      expect(dateCell.style.fill).toEqual({
        type: "pattern",
        pattern: "solid",
        fgColor: expectedDateFill.fgColor,
      });
      expect(dateCell.style.alignment).toEqual(expectedDateAlignment);
      expect(dateCell.style.numFmt).toBe(expectedDateNumFmt);
      expect(dateCell.style.border).toEqual(expectedDateBorder);

      if (i === timeline.col) {
        // For first date cell, formula is taken from start date cell's $col$row.
        const startFormula = worksheet.getCell(
          details.rows.startDate,
          timeline.col - 1,
        ).$col$row;
        expect(dateCell.value).toEqual({ formula: startFormula });
      } else {
        const prevLetter = worksheet.getColumn(i - 1).letter;
        const expectedFormula = `${prevLetter}${timeline.rows.date}+1`;
        expect(dateCell.value).toEqual({ formula: expectedFormula });
      }
      // Verify column width is set to 3.
      expect(worksheet.getColumn(i).width).toBe(3);
    }
  });

  it("should set daily weekday cells with proper style and formula", () => {
    const totalDays = 7;
    buildTimeline(worksheet as unknown as Worksheet, totalDays);

    // Expected weekStyle values.
    const expectedWeekFont = font.small;
    const expectedWeekFill = fill.light;
    const expectedWeekAlignment = alignment.center;
    const expectedWeekNumFmt = "mmmm dd, yyyy";
    const expectedWeekBorder = {
      top: borders.dark,
      left: borders.dark,
      right: borders.dark,
      bottom: borders.dark,
    };

    for (let i = timeline.col; i < timeline.col + totalDays; i++) {
      const weekdayCell = worksheet.getCell(timeline.rows.day, i);
      expect(weekdayCell.style.font).toEqual(expectedWeekFont);
      expect(weekdayCell.style.numFmt).toBe(expectedWeekNumFmt);
      expect(weekdayCell.style.fill).toEqual({
        type: "pattern",
        pattern: "solid",
        fgColor: expectedWeekFill.fgColor,
      });
      expect(weekdayCell.style.alignment).toEqual(expectedWeekAlignment);
      expect(weekdayCell.style.border).toEqual(expectedWeekBorder);
      // Expected formula uses current column's letter.
      const colLetter = worksheet.getColumn(i).letter;
      const expectedFormula = `=LEFT(TEXT(${colLetter}${timeline.rows.date},"ddd"),1)`;
      expect(weekdayCell.value).toEqual({ formula: expectedFormula });
    }
  });

  it("should set week cells at the start of each week with proper style, formula, and merged cells", () => {
    const totalDays = 14; // Two weeks.
    const END_TIMELINE = buildTimeline(
      worksheet as unknown as Worksheet,
      totalDays,
    );

    // For each week start (i - timeline.col) % 7 === 0.
    for (let i = timeline.col; i < END_TIMELINE; i += 7) {
      const weekCell = worksheet.getCell(timeline.rows.week, i);
      // Expected week style: same as expected weekday style.
      const expectedWeekFont = font.small;
      const expectedWeekFill = fill.light;
      const expectedWeekAlignment = alignment.center;
      const expectedWeekNumFmt = "mmmm dd, yyyy";
      const expectedWeekBorder = {
        top: borders.dark,
        left: borders.dark,
        right: borders.dark,
        bottom: borders.dark,
      };
      expect(weekCell.style.font).toEqual(expectedWeekFont);
      expect(weekCell.style.fill).toEqual({
        type: "pattern",
        pattern: "solid",
        fgColor: expectedWeekFill.fgColor,
      });
      expect(weekCell.style.alignment).toEqual(expectedWeekAlignment);
      expect(weekCell.style.border).toEqual(expectedWeekBorder);

      // Its value should be an object with formula referencing the corresponding date cell's $col$row.
      const dateCell = worksheet.getCell(timeline.rows.date, i);
      const expectedFormula = `=${dateCell.$col$row}`;
      expect(weekCell.value).toEqual({ formula: expectedFormula });
      expect(weekCell.style.numFmt).toBe(expectedWeekNumFmt);

      // Verify mergeCells was called with proper parameters.
      expect(worksheet.mergeCells).toHaveBeenCalledWith(
        timeline.rows.week,
        i,
        timeline.rows.week,
        Math.min(i + 6, END_TIMELINE - 1),
      );
    }
  });
});
