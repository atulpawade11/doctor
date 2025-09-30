export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  multipleImages?: string[];
};

export type EventFormData = {
  title: string;
  description: string;
  date: string;
};