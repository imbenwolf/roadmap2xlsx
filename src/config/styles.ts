import { Alignment, Border, FillPattern, Font } from "exceljs";
import { COLORS } from "./colors";

export const font: Record<
  "title" | "subtitle" | "large" | "normal" | "small",
  Partial<Font>
> = {
  title: { name: "Calibri", size: 22, bold: true },
  subtitle: { name: "Calibri", size: 14 },
  large: { name: "Calibri", size: 12 },
  normal: { name: "Calibri", size: 11 },
  small: { name: "Calibri", size: 9 },
};

export const alignment: Record<"center" | "left", Partial<Alignment>> = {
  center: { horizontal: "center", vertical: "middle" },
  left: { horizontal: "left", vertical: "middle", indent: 1 },
};

export const borders: Record<
  "dark" | "light" | "currentDay",
  Partial<Border>
> = {
  dark: { style: "thin", color: { argb: "808080" } },
  light: { style: "thin", color: { argb: "DFDFDF" } },
  currentDay: { style: "medium", color: { argb: COLORS.currentDay } },
};

export const fill: Record<"dark" | "light" | "todo" | "done", FillPattern> = {
  dark: { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } },
  light: { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } },
  todo: {
    type: "pattern",
    pattern: "solid",
    bgColor: { argb: COLORS.timeline.todo },
  },
  done: {
    type: "pattern",
    pattern: "solid",
    bgColor: { argb: COLORS.timeline.done },
  },
};
