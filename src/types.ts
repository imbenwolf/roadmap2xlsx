export interface Task {
  title: string;
  url: string;
  assignee: string;
  status: string;
  startDate: Date;
  endDate: Date;
}

export interface Repo {
  name: string;
  tasks: Task[];
}

export interface Project {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  repos: Repo[];
}
