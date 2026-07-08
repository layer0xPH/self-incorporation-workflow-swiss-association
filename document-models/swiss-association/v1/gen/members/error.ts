export type ErrorCode =
  | "MemberNotFoundError"
  | "MemberNotFoundForAddressError"
  | "DuplicateEthereumAddressError"
  | "MemberAlreadySignedError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class MemberNotFoundError extends Error implements ReducerError {
  errorCode = "MemberNotFoundError" as ErrorCode;
  constructor(message = "MemberNotFoundError") {
    super(message);
  }
}

export class MemberNotFoundForAddressError
  extends Error
  implements ReducerError
{
  errorCode = "MemberNotFoundForAddressError" as ErrorCode;
  constructor(message = "MemberNotFoundForAddressError") {
    super(message);
  }
}

export class DuplicateEthereumAddressError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateEthereumAddressError" as ErrorCode;
  constructor(message = "DuplicateEthereumAddressError") {
    super(message);
  }
}

export class MemberAlreadySignedError extends Error implements ReducerError {
  errorCode = "MemberAlreadySignedError" as ErrorCode;
  constructor(message = "MemberAlreadySignedError") {
    super(message);
  }
}

export const errors = {
  UpdateMember: { MemberNotFoundError },

  RemoveMember: { MemberNotFoundError },

  SetMemberEthereumAddress: {
    MemberNotFoundForAddressError,
    DuplicateEthereumAddressError,
    MemberAlreadySignedError,
  },
};
