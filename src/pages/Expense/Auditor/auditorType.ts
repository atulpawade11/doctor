export type AuditorUser = {
  image: string;
  name: string;
  email: string;
};

export type Auditor = {
  id: number;
  user: AuditorUser;
  firstName: string;
  lastName: string;
  mobileNo: string;
  email: string;
  password: string;
  category: string;
  unit: string;
  zone: string;
  location: string;
};