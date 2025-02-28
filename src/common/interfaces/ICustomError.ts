export interface ICustomResponsePayload {
  message: string;
  isSuccess?: number;
  isError?: number;
  payload?: unknown;
}
