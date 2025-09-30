export type SecretaryOption = {
  value: string ;
  label: string;
  EmpID: string;
};

export type MeetingNotification = {
  id: number;
  secretary: SecretaryOption | null;
  mobileNo: string | null;
  mobileNoAlternative: string | null;
};
