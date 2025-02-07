import { Style, Worksheet } from "exceljs";
import { font, alignment, fill, borders } from "../config/styles";
import { CELL_HEIGHT, LAYOUT, TASK_HEADER_WIDTH } from "../config/layout";

const getHeaderStyle = (key: keyof typeof font): Partial<Style> => ({
  font: font[key],
  alignment: alignment.left,
});

function setupTitle(worksheet: Worksheet): void {
  const { title } = LAYOUT.details.rows;
  const titleRow = worksheet.getRow(title);
  titleRow.height = CELL_HEIGHT * 2;
  worksheet.mergeCells(
    title,
    LAYOUT.details.col,
    title,
    LAYOUT.timeline.col - 1,
  );
  const titleCell = titleRow.getCell(LAYOUT.details.col);
  titleCell.value = "PROJECT TITLE";
  titleCell.style = getHeaderStyle("title");
}

function setupCompany(worksheet: Worksheet): void {
  const { company } = LAYOUT.details.rows;
  const companyRow = worksheet.getRow(company);
  companyRow.height = CELL_HEIGHT;
  const companyCell = companyRow.getCell(LAYOUT.details.col);
  companyCell.value = "COMPANY NAME";
  companyCell.style = getHeaderStyle("subtitle");
  worksheet.mergeCells(
    company,
    LAYOUT.details.col,
    company,
    LAYOUT.details.col + 1,
  );
}

function setupLead(worksheet: Worksheet): void {
  const { lead } = LAYOUT.details.rows;
  const leadRow = worksheet.getRow(lead);
  leadRow.height = CELL_HEIGHT;
  const leadCell = leadRow.getCell(LAYOUT.details.col);
  leadCell.value = "PROJECT LEAD";
  leadCell.style = getHeaderStyle("subtitle");
  worksheet.mergeCells(lead, LAYOUT.details.col, lead, LAYOUT.details.col + 1);
}

function setupProjectDates(
  worksheet: Worksheet,
  projectStart: Date,
  projectEnd: Date,
): void {
  const startDateRow = worksheet.getRow(LAYOUT.details.rows.startDate);
  const startDateTitle = startDateRow.getCell(LAYOUT.details.col + 3);
  startDateTitle.value = "Project Start:";
  startDateTitle.style = getHeaderStyle("large");

  const startDate = startDateRow.getCell(LAYOUT.details.col + 4);
  startDate.value = projectStart;
  startDate.style = { font: font.large, numFmt: "dd.mm.yyyy" };

  const endDateRow = worksheet.getRow(LAYOUT.details.rows.endDate);
  const endDateTitle = endDateRow.getCell(LAYOUT.details.col + 3);
  endDateTitle.value = "Project End:";
  endDateTitle.style = getHeaderStyle("large");

  const endDate = endDateRow.getCell(LAYOUT.details.col + 4);
  endDate.value = projectEnd;
  endDate.style = { font: font.large, numFmt: "dd.mm.yyyy" };
}

function setupTaskHeaders(worksheet: Worksheet): void {
  Object.entries(TASK_HEADER_WIDTH).forEach(([text, width], i) => {
    const col = worksheet.getColumn(i + 1);
    col.width = width;
    const taskHeaderRow = worksheet.getRow(LAYOUT.details.rows.taskHeader);
    taskHeaderRow.height = CELL_HEIGHT;
    const cell = worksheet.getCell(LAYOUT.details.rows.taskHeader, col.number);
    cell.value = text;
    cell.style = {
      font: { ...font.normal, bold: true },
      fill: fill.light,
      alignment: alignment.left,
      border: {
        top: borders.dark,
        bottom: borders.dark,
        left: borders.dark,
        right: borders.dark,
      },
    };
  });
}

export function setupHeader(
  worksheet: Worksheet,
  projectStart: Date,
  projectEnd: Date,
): void {
  setupTitle(worksheet);
  setupCompany(worksheet);
  setupLead(worksheet);
  setupProjectDates(worksheet, projectStart, projectEnd);
  setupTaskHeaders(worksheet);
}
