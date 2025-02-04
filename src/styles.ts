import { Fill, Font, Style } from "exceljs";

const fontFamily = "Calibri";

export const titleFont: Partial<Font> = {
  name: fontFamily,
  size: 22,
  bold: true,
};

export const subtitleFont: Partial<Font> = {
  name: fontFamily,
  size: 14,
};

export const projectDetailsFont: Partial<Font> = {
  name: fontFamily,
  size: 12,
};

export const defaultFont: Partial<Font> = {
  name: fontFamily,
  size: 11,
};

export const smallFont: Partial<Font> = {
  name: fontFamily,
  size: 9,
};

export const borders = {
  dark: { style: "thin", color: { argb: "808080" } },
  light: { style: "thin", color: { argb: "DFDFDF" } },
} as const;

export const dateNumberFill: Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "D9D9D9" },
};

export const weekdayFill: Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "F2F2F2" },
};

export const taskHeaderStyle: Partial<Style> = {
  font: { ...defaultFont, bold: true, color: { argb: "000000" } },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } },
  alignment: { vertical: "middle", horizontal: "center" },
  border: {
    top: { ...borders.dark },
    bottom: { ...borders.dark },
    left: { ...borders.dark },
    right: { ...borders.dark },
  },
};

export const repoColors = [
  { title: "8DB4E2", subtask: "C5D9F1" },
  { title: "E6B8B7", subtask: "F2DCDB" },
  { title: "D8E4BC", subtask: "EBF1DE" },
  { title: "CCC0DA", subtask: "E4DFEC" },
];

export const TASK_CELL_WIDTHS = [45, 20, 10, 15, 15] as const;
