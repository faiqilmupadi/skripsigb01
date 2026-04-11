export type LoginRequestBody = {
  identifier: string;
  password: string;
};

export type LoginSuccessResponse = {
  ok: true;
  redirectTo: `/${string}`;
  user: { userId: string | number; username: string; role: string };
};

export type LoginErrorResponse = {
  ok: false;
  message: string;
};

export type LoginApiResponse = LoginSuccessResponse | LoginErrorResponse;
