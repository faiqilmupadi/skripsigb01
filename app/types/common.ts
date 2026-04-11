
export type ApiFail = { ok: false; message: string };
export type ApiOk<T> = { ok: true } & T;
export type ApiResponse<T> = ApiOk<T> | ApiFail;
