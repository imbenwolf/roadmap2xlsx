import { Worksheet } from "exceljs";
import { Task } from "../types";
import {
  titleFont,
  subtitleFont,
  projectDetailsFont,
  taskHeaderStyle,
  TASK_CELL_WIDTHS,
} from "../styles";
import { LAYOUT } from "../layout";

export function setupHeader(worksheet: Worksheet, tasks: Task[]): void {
  const titleRow = worksheet.getRow(LAYOUT.DETAILS.ROWS.TITLE);
  titleRow.height = 30;
  worksheet.mergeCells(
    LAYOUT.DETAILS.ROWS.TITLE,
    LAYOUT.DETAILS.COL,
    LAYOUT.DETAILS.ROWS.TITLE,
    LAYOUT.TIMELINE.COL - 1,
  );
  const titleCell = titleRow.getCell(LAYOUT.DETAILS.COL);
  titleCell.value = "PROJECT TITLE";
  titleCell.font = titleFont;

  const companyCell = worksheet.getCell(
    LAYOUT.DETAILS.ROWS.COMPANY,
    LAYOUT.DETAILS.COL,
  );
  companyCell.value = "COMPANY NAME";
  companyCell.font = subtitleFont;
  worksheet.mergeCells(
    LAYOUT.DETAILS.ROWS.COMPANY,
    LAYOUT.DETAILS.COL,
    LAYOUT.DETAILS.ROWS.COMPANY,
    LAYOUT.DETAILS.COL + 1,
  );

  const leadCell = worksheet.getCell(
    LAYOUT.DETAILS.ROWS.LEAD,
    LAYOUT.DETAILS.COL,
  );
  leadCell.value = "PROJECT LEAD";
  leadCell.font = subtitleFont;
  worksheet.mergeCells(
    LAYOUT.DETAILS.ROWS.LEAD,
    LAYOUT.DETAILS.COL,
    LAYOUT.DETAILS.ROWS.LEAD,
    LAYOUT.DETAILS.COL + 1,
  );

  // Sort tasks to get project start/end
  const sorted = [...tasks].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );
  const projectStart = sorted[0]?.startDate || new Date();
  const projectEnd = sorted[sorted.length - 1]?.endDate || new Date();

  const projectStartTitle = worksheet.getCell(
    LAYOUT.DETAILS.ROWS.START_DATE,
    LAYOUT.TIMELINE.COL - 2,
  );
  projectStartTitle.value = "Project Start:";
  projectStartTitle.font = projectDetailsFont;

  const projectStartDate = worksheet.getCell(
    LAYOUT.DETAILS.ROWS.START_DATE,
    LAYOUT.TIMELINE.COL - 1,
  );
  projectStartDate.value = projectStart;
  projectStartDate.font = projectDetailsFont;
  projectStartDate.numFmt = "dd.mm.yyyy";

  const projectEndTitle = worksheet.getCell(
    LAYOUT.DETAILS.ROWS.END_DATE,
    LAYOUT.TIMELINE.COL - 2,
  );
  projectEndTitle.value = "Project End:";
  projectEndTitle.font = projectDetailsFont;

  const projectEndDate = worksheet.getCell(
    LAYOUT.DETAILS.ROWS.END_DATE,
    LAYOUT.TIMELINE.COL - 1,
  );
  projectEndDate.value = projectEnd;
  projectEndDate.font = projectDetailsFont;
  projectEndDate.numFmt = "dd.mm.yyyy";

  const headers = ["TASK", "ASSIGNEE", "PROGRESS", "START DATE", "END DATE"];
  headers.forEach((text, i) => {
    const col = worksheet.getColumn(i + 1);
    col.width = TASK_CELL_WIDTHS[i];

    const cell = worksheet.getCell(LAYOUT.DETAILS.ROWS.HEADER, col.number);
    cell.value = text;
    cell.style = taskHeaderStyle;
  });
}
