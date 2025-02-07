import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Worksheet } from "exceljs";
import { setupHeader } from "./header";
import { CELL_HEIGHT, LAYOUT, TASK_HEADER_WIDTH } from "../config/layout";
import { font, alignment, fill, borders } from "../config/styles";
import { Row, Column } from "exceljs";
import { Cell } from "exceljs";

// Create a fake worksheet with minimal behavior.
interface FakeRow extends Row {
  cells: Record<number, Cell>;
}
interface FakeWorksheet extends Partial<Worksheet> {
  rows: Partial<Row>[];
  columns: Partial<Column>[];
  getRow: (row: number) => FakeRow;
  getColumn: (col: number) => Column;
  mergeCells: jest.Mock;
  getCell: (row: number, col: number) => Cell;
}

describe("setupHeader", () => {
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
  });

  const projectStart = new Date("2020-01-01");
  const projectEnd = new Date("2020-01-20");

  it("sets up title correctly", () => {
    setupHeader(worksheet as Worksheet, projectStart, projectEnd);
    const titleRow = worksheet.getRow(LAYOUT.details.rows.title);
    expect(titleRow.height).toBe(CELL_HEIGHT * 2);

    // Check mergeCells call for title.
    expect(worksheet.mergeCells).toHaveBeenCalledWith(
      LAYOUT.details.rows.title,
      LAYOUT.details.col,
      LAYOUT.details.rows.title,
      LAYOUT.timeline.col - 1,
    );

    const titleCell = titleRow.getCell(LAYOUT.details.col);
    expect(titleCell.value).toBe("PROJECT TITLE");
    expect(titleCell.style).toEqual({
      font: font.title,
      alignment: alignment.left,
    });
  });

  it("sets up company correctly", () => {
    setupHeader(worksheet as Worksheet, projectStart, projectEnd);
    const companyRow = worksheet.getRow(LAYOUT.details.rows.company);
    expect(companyRow.height).toBe(CELL_HEIGHT);

    const companyCell = companyRow.getCell(LAYOUT.details.col);
    expect(companyCell.value).toBe("COMPANY NAME");
    expect(companyCell.style).toEqual({
      font: font.subtitle,
      alignment: alignment.left,
    });

    expect(worksheet.mergeCells).toHaveBeenCalledWith(
      LAYOUT.details.rows.company,
      LAYOUT.details.col,
      LAYOUT.details.rows.company,
      LAYOUT.details.col + 1,
    );
  });

  it("sets up lead correctly", () => {
    setupHeader(worksheet as Worksheet, projectStart, projectEnd);
    const leadRow = worksheet.getRow(LAYOUT.details.rows.lead);
    expect(leadRow.height).toBe(CELL_HEIGHT);

    const leadCell = leadRow.getCell(LAYOUT.details.col);
    expect(leadCell.value).toBe("PROJECT LEAD");
    expect(leadCell.style).toEqual({
      font: font.subtitle,
      alignment: alignment.left,
    });

    expect(worksheet.mergeCells).toHaveBeenCalledWith(
      LAYOUT.details.rows.lead,
      LAYOUT.details.col,
      LAYOUT.details.rows.lead,
      LAYOUT.details.col + 1,
    );
  });

  it("sets up project dates correctly", () => {
    setupHeader(worksheet as Worksheet, projectStart, projectEnd);
    const companyRow = worksheet.getRow(LAYOUT.details.rows.company);
    const leadRow = worksheet.getRow(LAYOUT.details.rows.lead);

    // Project start
    const projectStartTitleCell = companyRow.getCell(LAYOUT.details.col + 3);
    expect(projectStartTitleCell.value).toBe("Project Start:");
    expect(projectStartTitleCell.style).toEqual({
      font: font.large,
      alignment: alignment.left,
    });

    const projectStartDateCell = companyRow.getCell(LAYOUT.details.col + 4);
    expect(projectStartDateCell.value).toEqual(projectStart);
    expect(projectStartDateCell.style).toEqual({
      font: font.large,
      numFmt: "dd.mm.yyyy",
    });

    // Project end
    const projectEndTitleCell = leadRow.getCell(LAYOUT.details.col + 3);
    expect(projectEndTitleCell.value).toBe("Project End:");
    expect(projectEndTitleCell.style).toEqual({
      font: font.large,
      alignment: alignment.left,
    });

    const projectEndDateCell = leadRow.getCell(LAYOUT.details.col + 4);
    expect(projectEndDateCell.value).toEqual(projectEnd);
    expect(projectEndDateCell.style).toEqual({
      font: font.large,
      numFmt: "dd.mm.yyyy",
    });
  });

  it("sets up task headers correctly", () => {
    setupHeader(worksheet as Worksheet, projectStart, projectEnd);
    const taskHeaderRow = worksheet.getRow(LAYOUT.details.rows.taskHeader);
    expect(taskHeaderRow.height).toBe(CELL_HEIGHT);

    Object.entries(TASK_HEADER_WIDTH).forEach(([text, width], i) => {
      const col = worksheet.getColumn(i + 1);
      expect(col.width).toBe(width);

      const cell = worksheet.getCell(
        LAYOUT.details.rows.taskHeader,
        col.number,
      );
      expect(cell.value).toBe(text);
      expect(cell.style).toEqual({
        font: { ...font.normal, bold: true },
        fill: fill.light,
        alignment: alignment.left,
        border: {
          top: borders.dark,
          bottom: borders.dark,
          left: borders.dark,
          right: borders.dark,
        },
      });
    });
  });
});
