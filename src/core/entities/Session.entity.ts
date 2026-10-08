export namespace SessionEntity {
  export interface User {
    token: string;
    id: string;
    email: string;
    fullName: string;
  }

  export interface Entity {
    isAuth: boolean;
    user: User;
  }
}
