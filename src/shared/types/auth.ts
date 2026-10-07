export type User = {
  token: string;
  id: string;
  email: string;
  fullName: string;
};

export type Session = {
  user: User;
};
