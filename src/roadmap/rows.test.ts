// src/roadmap/rows.test.ts
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { addRows } from "./rows";
import { Repo } from "../types";
import { CELL_HEIGHT, LAYOUT } from "../config/layout";
import { borders, fill } from "../config/styles";
import { COLORS } from "../config/colors"; // Assuming COLORS.repos exists
import { Worksheet } from "exceljs";
import { Cell } from "exceljs";
import { FillPattern } from "exceljs";

const { details, timeline } = LAYOUT;

/**
 * Define our own fake interfaces without extending Worksheet.
 */

interface FakeRow {
  number: number;
  height: number;
  cells: Record<number, Cell>;
  getCell: (col: number) => Cell;
}

interface FakeColumn {
  letter: string;
  width?: number;
}

interface FakeWorksheet {
  rows: Record<number, FakeRow>;
  columns: Record<number, FakeColumn>;
  getRow: (row: number) => FakeRow;
  addRow: (values: unknown[]) => FakeRow;
  mergeCells: jest.Mock;
  getCell: (row: number, col: number) => Cell;
  getColumn: (col: number) => FakeColumn;
}

/**
 * Factory function that creates a fresh fake worksheet.
 */
function createFakeWorksheet(): FakeWorksheet {
  const rows: Record<number, FakeRow> = {};
  const columns: Record<number, FakeColumn> = {};

  const getRow = (rowNum: number): FakeRow => {
    if (!rows[rowNum]) {
      rows[rowNum] = {
        number: rowNum,
        height: 0,
        cells: {},
        getCell: (col: number): Cell => {
          if (!rows[rowNum].cells[col]) {
            rows[rowNum].cells[col] = {} as Cell;
          }
          return rows[rowNum].cells[col];
        },
      };
    }
    return rows[rowNum];
  };

  const addRow = (): FakeRow => {
    const rowNum =
      Object.keys(rows).length > 0
        ? Math.max(...Object.keys(rows).map(Number)) + 1
        : 1;
    return getRow(rowNum);
  };

  const getCell = (rowNum: number, col: number): Cell => {
    return getRow(rowNum).getCell(col);
  };

  const getColumn = (colNum: number): FakeColumn => {
    if (!columns[colNum]) {
      // Convert col number to a letter: 1 -> A, 2 -> B, etc.
      columns[colNum] = { letter: String.fromCharCode(64 + colNum) };
    }
    return columns[colNum];
  };

  // Fake mergeCells: mark the starting cell with isMerged=true.
  const mergeCells = jest.fn((startRow: unknown, startCol: unknown) => {
    const cell = getCell(startRow as number, startCol as number);
    Object.assign(cell, { isMerged: true });
  });

  return { rows, columns, getRow, addRow, mergeCells, getCell, getColumn };
}

describe("addRows", () => {
  let worksheet: FakeWorksheet;
  // totalDays provided to addRows
  const totalDays = 5;
  const endCol = timeline.col + totalDays;

  beforeEach(() => {
    // Get a fresh fake worksheet before each test.
    worksheet = createFakeWorksheet();
  });

  // Sample repos with tasks.
  const repos: Repo[] = [
    {
      name: "Repo A",
      tasks: [
        {
          title: "Task 1",
          assignee: "Alice",
          status: "Todo",
          startDate: new Date("2021-01-01"),
          endDate: new Date("2021-01-05"),
          url: "dummy",
        },
        {
          title: "Task 2",
          assignee: "Bob",
          status: "Done",
          startDate: new Date("2021-01-02"),
          endDate: new Date("2021-01-06"),
          url: "dummy",
        },
      ],
    },
    {
      name: "Repo B",
      tasks: [
        {
          title: "Task 3",
          assignee: "Charlie",
          status: "In Progress",
          startDate: new Date("2021-01-03"),
          endDate: new Date("2021-01-07"),
          url: "dummy",
        },
      ],
    },
  ];

  it("should add the correct total number of rows", () => {
    /* Expected rows:
         - Repo A: 1 header + 2 task rows.
         - Repo B: 1 header + 1 task row.
         - Plus 1 last row.
         Total = (1+2) + (1+1) + 1 = 6 rows.
    */
    addRows(worksheet as unknown as Worksheet, repos, totalDays);
    const totalRows = Object.keys(worksheet.rows).length;
    expect(totalRows).toBe(6);
  });

  it("should add a repo header row with merged cell and timeline borders using dark borders", () => {
    addRows(worksheet as unknown as Worksheet, repos, totalDays);
    // The first row should be the header for Repo A.
    const repoRow = worksheet.getRow(1);
    expect(repoRow.height).toBe(CELL_HEIGHT);
    const repoCell = repoRow.getCell(details.col);
    expect(repoCell.value).toBe("Repo A");
    // Check that the repo header cell is merged.
    expect(repoCell.isMerged).toBe(true);

    // Check timeline borders on the repo header row.
    for (let col = timeline.col; col < endCol; col++) {
      const border = repoRow.getCell(col).border;
      // For repo header rows, our implementation uses dark borders on top and bottom.
      expect(border.top).toEqual(borders.dark);
      expect(border.bottom).toEqual(borders.dark);
      // For repo header rows, left border is not set (except via mergeCells, which we already checked),
      // and only the last timeline cell should have a right border.
      expect(border.left).toBeUndefined();
      if (col === endCol - 1) {
        expect(border.right).toEqual(borders.dark);
      } else {
        expect(border.right).toBeUndefined();
      }
    }
  });

  it("should add task rows with correct details and timeline borders using light borders", () => {
    addRows(worksheet as unknown as Worksheet, repos, totalDays);
    // For Repo A, the first task row is row 2.
    const taskRow = worksheet.getRow(2);
    expect(taskRow.height).toBe(CELL_HEIGHT);
    // Check task details.
    const titleCell = taskRow.getCell(details.col);
    expect(titleCell.value).toContain("Task 1");
    const assigneeCell = taskRow.getCell(details.col + 1);
    expect(assigneeCell.value).toBe("Alice");
    const statusCell = taskRow.getCell(details.col + 2);
    expect(statusCell.value).toBe(0); // "Todo" maps to 0.
    const startCell = taskRow.getCell(details.col + 3);
    expect(startCell.value).toEqual(new Date("2021-01-01"));
    expect(startCell.numFmt).toBe("dd.mm.yyyy");
    const endCell = taskRow.getCell(details.col + 4);
    expect(endCell.value).toEqual(new Date("2021-01-05"));
    expect(endCell.numFmt).toBe("dd.mm.yyyy");

    // Check that the fill for detail columns matches the expected subtask color.
    // We assume that COLORS.repos[0][1] is the subtask color for Repo A.
    for (let col = details.col; col < timeline.col; col++) {
      const cellFill = taskRow.getCell(col).fill as FillPattern;
      expect(cellFill.fgColor!.argb).toBe(COLORS.repos[0][1]);
    }

    // Check timeline borders on task row.
    for (let col = timeline.col; col < endCol; col++) {
      const border = taskRow.getCell(col).border;
      // For task rows, the implementation uses light borders for top and bottom.
      expect(border.top).toEqual(borders.light);
      expect(border.bottom).toEqual(borders.light);
      // For left border: the first timeline cell gets dark; others light.
      if (col === timeline.col) {
        expect(border.left).toEqual(borders.dark);
      } else {
        expect(border.left).toEqual(borders.light);
      }
      // For right border: the last timeline cell gets dark; others light.
      if (col === endCol - 1) {
        expect(border.right).toEqual(borders.dark);
      } else {
        expect(border.right).toEqual(borders.light);
      }
    }
  });

  it("should add the last row with correct fill and borders", () => {
    addRows(worksheet as unknown as Worksheet, repos, totalDays);
    // With a total of 6 rows, the last row is row 6.
    const lastRow = worksheet.getRow(6);
    for (let col = details.col; col < endCol; col++) {
      const cell = lastRow.getCell(col);
      // In our implementation, the last row cells' style.fill is set to fill.light.
      expect(cell.style?.fill).toEqual(fill.light);
      const expectedBorder = {
        top: borders.dark,
        bottom: borders.dark,
        ...(col === details.col && { left: borders.dark }),
        ...(col === endCol - 1 && { right: borders.dark }),
      };
      expect(cell.border).toEqual(expectedBorder);
    }
  });
});
