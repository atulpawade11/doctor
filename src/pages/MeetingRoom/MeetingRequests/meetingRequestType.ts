export type MeetingRequest = {
  id: number;
  userName: string;
  department: string;
  location: string;
  meetingRoom: string;
  timings: string; // ISO timestamp
  status: "Approved" | "Disapproved";
};
