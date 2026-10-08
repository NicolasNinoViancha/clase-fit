export namespace LoginScreenModels {
  export interface ViewModel {
    email: string;
    password: string;
    error: string | null;
    onChangeEmail: (value: string) => void;
    onChangePassword: (value: string) => void;
    onSubmit: () => void;
  }
}
