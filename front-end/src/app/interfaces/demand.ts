export interface DemandLogItem {
  text: string;
  createdAt: string;
}
export interface Demanda {
  id: number;
  title: string;
  priority: number;
  status: string;
  date: string; // Deadline
  createdAt: string; // Creation date
  completionDate?: string;
  description: string;
  owner: string;
  gitLink: string;
  problems: DemandLogItem[] | null;
  observations: DemandLogItem[] | null;
  comments: DemandLogItem[] | null;
}