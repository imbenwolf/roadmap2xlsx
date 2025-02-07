const BASE = {
  startRow: 1,
  startCol: 1,
};
const DETAILS_ROWS = {
  title: BASE.startRow,
  company: BASE.startRow + 1,
  lead: BASE.startRow + 2,

  startDate: BASE.startRow + 1,
  endDate: BASE.startRow + 2,

  taskHeader: BASE.startRow + 3,
};
const TIMELINE_ROWS = {
  week: BASE.startRow + 1,
  date: BASE.startRow + 2,
  day: BASE.startRow + 3,
};

const TASK_HEADERS = [
  "TASK",
  "ASSIGNEE",
  "PROGRESS",
  "START DATE",
  "END DATE",
] as const;

export const CELL_HEIGHT = 20;
export const TASK_HEADER_WIDTH: Record<(typeof TASK_HEADERS)[number], number> =
  {
    TASK: 45,
    ASSIGNEE: 20,
    PROGRESS: 10,
    "START DATE": 15,
    "END DATE": 15,
  };

export const LAYOUT = {
  details: {
    col: BASE.startCol,
    rows: DETAILS_ROWS,
  },
  timeline: {
    col: BASE.startCol + TASK_HEADERS.length,
    rows: TIMELINE_ROWS,
  },
} as const;
