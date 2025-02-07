import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Worksheet } from "exceljs";
import { applyConditionalFormatting } from "./formatting";
import { ExpressionRuleType } from "exceljs";
import { ConditionalFormattingOptions } from "exceljs";

// Mock layout, styles, and fill dependencies
jest.mock("../config/layout", () => ({
  LAYOUT: {
    timeline: {
      col: 2, // starting at column 2
      rows: {
        date: 1,
        day: 2,
      },
    },
  },
}));

jest.mock("../config/styles", () => ({
  borders: {
    currentDay: { style: "medium", color: { argb: "FF0000" } },
    dark: { style: "thin", color: { argb: "000000" } },
  },
  fill: {
    done: { type: "pattern", pattern: "solid", bgColor: { argb: "00FF00" } },
    todo: { type: "pattern", pattern: "solid", bgColor: { argb: "0000FF" } },
  },
}));

// This type describes one call to worksheet.addConditionalFormatting.
type Call = ConditionalFormattingOptions & {
  rules: ExpressionRuleType[];
};

describe("applyConditionalFormatting", () => {
  let worksheet: Worksheet;
  const totalRows = 10; // total number of rows for testing

  beforeEach(() => {
    // Create a dummy worksheet that implements the necessary methods.
    worksheet = {
      addConditionalFormatting: jest.fn(),
      getColumn: jest.fn(),
      getCell: jest.fn(),
      rowCount: totalRows,
    } as unknown as Worksheet;

    // getColumn returns an object with a letter property.
    // For simplicity, we use ASCII: 2 -> B, 3 -> C, etc.
    (worksheet.getColumn as jest.Mock).mockImplementation(
      (colIndex: unknown) => ({
        letter: String.fromCharCode(64 + (colIndex as number)),
      }),
    );

    // getCell returns a dummy cell with an empty border object.
    (worksheet.getCell as jest.Mock).mockImplementation(() => ({
      border: {},
    }));
  });

  describe("call count", () => {
    it("calls addConditionalFormatting the expected number of times", async () => {
      const { LAYOUT } = await import("../config/layout");
      const totalDays = 5; // Process columns 2, 3, and 4.

      // For each column:
      // - 2 calls: one for date and one for weekday.
      // - Task rows: from (day + 1) up to (worksheet.rowCount - 1).
      // With LAYOUT.timeline.rows.day set to 2, task rows are rows 3 to 9.
      const taskRowCount = worksheet.rowCount - (LAYOUT.timeline.rows.day + 1); // 10 - 3 = 7
      const expectedCallsPerColumn = 2 + taskRowCount;
      const expectedTotalCalls = totalDays * expectedCallsPerColumn;

      applyConditionalFormatting(worksheet, totalDays);
      expect(worksheet.addConditionalFormatting).toHaveBeenCalledTimes(
        expectedTotalCalls,
      );
    });
  });

  describe("conditional formatting properties", () => {
    it("applies date and weekday formatting correctly", () => {
      const totalDays = 1;
      applyConditionalFormatting(worksheet, totalDays);

      // The first two calls should be for the date and weekday rows.
      const dateCall = (worksheet.addConditionalFormatting as jest.Mock).mock
        .calls[0][0] as Call;
      const weekdayCall = (worksheet.addConditionalFormatting as jest.Mock).mock
        .calls[1][0] as Call;

      // Check the date row call: expected reference "B1"
      expect(dateCall.ref).toBe("B1");
      expect(dateCall.rules).toHaveLength(1);
      expect(dateCall.rules[0].type).toBe("expression");
      expect(dateCall.rules[0].formulae![0]).toBe(
        "AND(TODAY()>=B1,TODAY()<B1+1)",
      );
      expect(dateCall.rules[0].style!.border).toEqual({
        left: { style: "medium", color: { argb: "FF0000" } },
        right: { style: "medium", color: { argb: "FF0000" } },
        top: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
      });

      // Check the weekday row call: expected reference "B2"
      expect(weekdayCall.ref).toBe("B2");
      expect(weekdayCall.rules).toHaveLength(1);
      expect(weekdayCall.rules[0].formulae![0]).toBe(
        "AND(TODAY()>=B1,TODAY()<B1+1)",
      );
    });

    it("applies task row formatting correctly for a specific row", () => {
      const endTimeline = 3; // Only processing column 2 (B)
      applyConditionalFormatting(worksheet, endTimeline);

      // Task rows start at row (day + 1). With day = 2, task rows are rows 3 to 9.
      // We'll inspect the formatting applied to row 4 as a sample.
      const taskRow = 4;
      // The first two calls are for date and weekday formatting,
      // so task rows start at index 2.
      // For row 4, the call index is: 2 + (4 - 3) = 3.
      const taskCallIndex = 2 + (taskRow - 3);
      const taskCall = (worksheet.addConditionalFormatting as jest.Mock).mock
        .calls[taskCallIndex][0] as Call;

      // Verify the reference is correct (column B, row 4 => "B4")
      expect(taskCall.ref).toBe("B4");
      // There should be three rules for each task row.
      expect(taskCall.rules).toHaveLength(3);

      // Check the first rule (progress.done)
      const doneRule = taskCall.rules[0];
      expect(doneRule.type).toBe("expression");
      expect(doneRule.formulae![0]).toContain("D$4");
      expect(doneRule.style!.fill).toEqual({
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "00FF00" },
      });

      // Check the second rule (progress.todo)
      const todoRule = taskCall.rules[1];
      expect(todoRule.type).toBe("expression");
      expect(todoRule.formulae![0]).toContain("E$4");
      expect(todoRule.style!.fill).toEqual({
        type: "pattern",
        pattern: "solid",
        bgColor: { argb: "0000FF" },
      });

      // Check the third rule (current day border)
      const currentDayRule = taskCall.rules[2];
      expect(currentDayRule.type).toBe("expression");
      expect(currentDayRule.formulae![0]).toContain("B1");
      // Since getCell returns an empty border, we only get the overrides for left and right.
      expect(currentDayRule.style!.border).toEqual({
        left: { style: "medium", color: { argb: "FF0000" } },
        right: { style: "medium", color: { argb: "FF0000" } },
      });
    });
  });
});
