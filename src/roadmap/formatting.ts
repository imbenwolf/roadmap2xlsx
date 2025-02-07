import { Worksheet } from "exceljs";
import { borders, fill } from "../config/styles";
import { LAYOUT } from "../config/layout";

function applyDateAndWeekdayFormatting(
  worksheet: Worksheet,
  colLetter: string,
): void {
  const { date, day } = LAYOUT.timeline.rows;
  [date, day].forEach((row) => {
    worksheet.addConditionalFormatting({
      ref: `${colLetter}${row}`,
      rules: [
        {
          type: "expression",
          priority: 0,
          formulae: [
            `AND(TODAY()>=${colLetter}${date},TODAY()<${colLetter}${date}+1)`,
          ],
          style: {
            border: {
              left: borders.currentDay,
              right: borders.currentDay,
              top: borders.dark,
              bottom: borders.dark,
            },
          },
        },
      ],
    });
  });
}

function applyTaskRowFormatting(worksheet: Worksheet, colLetter: string): void {
  const { date, day } = LAYOUT.timeline.rows;
  for (let rowNum = day + 1; rowNum < worksheet.rowCount; rowNum++) {
    const cellRef = `${colLetter}${rowNum}`;
    const cellBorder = worksheet.getCell(cellRef).border;

    worksheet.addConditionalFormatting({
      ref: cellRef,
      rules: [
        {
          type: "expression",
          priority: 0,
          formulae: [
            `AND(D$${rowNum}<=${colLetter}${date},ROUNDDOWN((E$${rowNum}-D$${rowNum}+1)*C$${rowNum}/100,0)+D$${rowNum}-1>=${colLetter}${date})`,
          ],
          style: {
            fill: fill.done,
          },
        },
        {
          type: "expression",
          priority: 0,
          formulae: [
            `AND(E$${rowNum}>=${colLetter}${date},D$${rowNum}<${colLetter}${date}+1)`,
          ],
          style: {
            fill: fill.todo,
          },
        },
        {
          type: "expression",
          priority: 0,
          formulae: [
            `AND(TODAY()>=${colLetter}${date},TODAY()<${colLetter}${date}+1)`,
          ],
          style: {
            border: {
              ...cellBorder,
              left: borders.currentDay,
              right: borders.currentDay,
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

export function applyConditionalFormatting(
  worksheet: Worksheet,
  totalDays: number,
): void {
  for (let i = 0; i < totalDays; i++) {
    const colLetter = worksheet.getColumn(LAYOUT.timeline.col + i).letter;
    applyDateAndWeekdayFormatting(worksheet, colLetter);
    applyTaskRowFormatting(worksheet, colLetter);
  }
}
