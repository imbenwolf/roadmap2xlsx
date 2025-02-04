import { Worksheet } from "exceljs";
import { borders } from "../styles";
import { LAYOUT } from "../layout";

export function applyConditionalFormatting(
  worksheet: Worksheet,
  endTimeline: number
): void {
  for (let i = LAYOUT.TIMELINE.COL; i < endTimeline; i++) {
    const colLetter = worksheet.getColumn(i).letter;
    // Date row formatting
    worksheet.addConditionalFormatting({
      ref: `${colLetter}${LAYOUT.TIMELINE.ROWS.DATE}`,
      rules: [
        {
          type: "expression",
          priority: 0,
          formulae: [
            `AND(TODAY()>=${colLetter}${LAYOUT.TIMELINE.ROWS.DATE},TODAY()<${colLetter}${LAYOUT.TIMELINE.ROWS.DATE}+1)`,
          ],
          style: {
            border: {
              left: { style: "medium", color: { argb: "00B050" } },
              right: { style: "medium", color: { argb: "00B050" } },
              top: borders.dark,
              bottom: borders.dark,
            },
          },
        },
      ],
    });

    // Weekday row formatting
    worksheet.addConditionalFormatting({
      ref: `${colLetter}${LAYOUT.TIMELINE.ROWS.DAY}`,
      rules: [
        {
          type: "expression",
          priority: 0,
          formulae: [
            `AND(TODAY()>=${colLetter}${LAYOUT.TIMELINE.ROWS.DATE},TODAY()<${colLetter}${LAYOUT.TIMELINE.ROWS.DATE}+1)`,
          ],
          style: {
            border: {
              left: { style: "medium", color: { argb: "00B050" } },
              right: { style: "medium", color: { argb: "00B050" } },
              top: borders.dark,
              bottom: borders.dark,
            },
          },
        },
      ],
    });

    // Task rows formatting
    for (
      let rowNum = LAYOUT.TIMELINE.ROWS.DAY + 1;
      rowNum < worksheet.rowCount;
      rowNum++
    ) {
      worksheet.addConditionalFormatting({
        ref: `${colLetter}${rowNum}`,
        rules: [
          {
            // Light-blue fill for “completed portion”
            type: "expression",
            priority: 0,
            formulae: [
              `AND(D$${rowNum}<=${colLetter}${LAYOUT.TIMELINE.ROWS.DATE},ROUNDDOWN((E$${rowNum}-D$${rowNum}+1)*C$${rowNum}/100,0)+D$${rowNum}-1>=${colLetter}${LAYOUT.TIMELINE.ROWS.DATE})`,
            ],
            style: {
              fill: {
                type: "pattern",
                pattern: "solid",
                bgColor: { argb: "00B0F0" },
              },
            },
          },
          {
            // Dark-blue fill for the “remaining portion”
            type: "expression",
            priority: 0,
            formulae: [
              `AND(E$${rowNum}>=${colLetter}${LAYOUT.TIMELINE.ROWS.DATE},D$${rowNum}<${colLetter}${LAYOUT.TIMELINE.ROWS.DATE}+1)`,
            ],
            style: {
              fill: {
                type: "pattern",
                pattern: "solid",
                bgColor: { argb: "0070C0" },
              },
            },
          },
          {
            // Green border for “today”
            type: "expression",
            priority: 0,
            formulae: [
              `AND(TODAY()>=${colLetter}${LAYOUT.TIMELINE.ROWS.DATE},TODAY()<${colLetter}${LAYOUT.TIMELINE.ROWS.DATE}+1)`,
            ],
            style: {
              border: {
                ...worksheet.getCell(`${colLetter}${rowNum}`).border,
                left: { style: "medium", color: { argb: "00B050" } },
                right: { style: "medium", color: { argb: "00B050" } },
                ...(rowNum === worksheet.rowCount - 1 && {
                  bottom: borders.dark,
                }),
              },
            },
          },
        ],
      });
    }
  }
}
