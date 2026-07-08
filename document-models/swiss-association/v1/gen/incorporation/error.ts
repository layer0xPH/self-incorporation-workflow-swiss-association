export type ErrorCode =
  | "AlreadyIncorporatedError"
  | "MissingSignerError"
  | "NoFoundingMembersError"
  | "SignerNotFoundingMemberError"
  | "AlreadySignedError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class AlreadyIncorporatedError extends Error implements ReducerError {
  errorCode = "AlreadyIncorporatedError" as ErrorCode;
  constructor(message = "AlreadyIncorporatedError") {
    super(message);
  }
}

export class MissingSignerError extends Error implements ReducerError {
  errorCode = "MissingSignerError" as ErrorCode;
  constructor(message = "MissingSignerError") {
    super(message);
  }
}

export class NoFoundingMembersError extends Error implements ReducerError {
  errorCode = "NoFoundingMembersError" as ErrorCode;
  constructor(message = "NoFoundingMembersError") {
    super(message);
  }
}

export class SignerNotFoundingMemberError
  extends Error
  implements ReducerError
{
  errorCode = "SignerNotFoundingMemberError" as ErrorCode;
  constructor(message = "SignerNotFoundingMemberError") {
    super(message);
  }
}

export class AlreadySignedError extends Error implements ReducerError {
  errorCode = "AlreadySignedError" as ErrorCode;
  constructor(message = "AlreadySignedError") {
    super(message);
  }
}

export const errors = {
  SignForIncorporation: {
    AlreadyIncorporatedError,
    MissingSignerError,
    NoFoundingMembersError,
    SignerNotFoundingMemberError,
    AlreadySignedError,
  },
};
