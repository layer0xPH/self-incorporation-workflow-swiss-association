import type { SwissAssociationIncorporationOperations } from "document-models/swiss-association/v1";
import {
  AlreadyIncorporatedError,
  AlreadySignedError,
  MissingSignerError,
  NoFoundingMembersError,
  SignerNotFoundingMemberError,
} from "../../gen/incorporation/error.js";

export const swissAssociationIncorporationOperations: SwissAssociationIncorporationOperations =
  {
    signForIncorporationOperation(state, action) {
      const signerAddress = action.context?.signer?.user.address;
      if (state.incorporationCompletedAt)
        throw new AlreadyIncorporatedError("Entity is already incorporated");
      if (!signerAddress)
        throw new MissingSignerError("No signer address on the action");
      if (state.members.length === 0)
        throw new NoFoundingMembersError("No founding members to sign for");
      const normalized = signerAddress.toLowerCase();
      const member = state.members.find(
        (m) =>
          m.ethereumAddress && m.ethereumAddress.toLowerCase() === normalized,
      );
      if (!member)
        throw new SignerNotFoundingMemberError(
          "Signer address does not match any founding member",
        );
      if (member.incorporationSignedAt)
        throw new AlreadySignedError("This founding member has already signed");
      member.incorporationSignedAt = action.input.signedAt;
      const allSigned = state.members.every((m) => m.incorporationSignedAt);
      if (allSigned) {
        state.incorporationCompletedAt = action.input.signedAt;
      }
    },
  };
