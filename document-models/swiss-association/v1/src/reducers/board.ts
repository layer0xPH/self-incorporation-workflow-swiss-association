import type { SwissAssociationBoardOperations } from "document-models/swiss-association/v1";
import { BoardMemberNotFoundError } from "../../gen/board/error.js";
import { updatePersonalunionFlag } from "./personalunion.js";

export const swissAssociationBoardOperations: SwissAssociationBoardOperations =
  {
    setMeetingRolesOperation(state, action) {
      state.chairName = action.input.chairName;
      state.chairRole = action.input.chairRole;
      state.secretaryName = action.input.secretaryName;
      state.secretaryRole = action.input.secretaryRole;
      state.meetingIsOnline = action.input.meetingIsOnline;
      state.meetingVenue = action.input.meetingIsOnline
        ? null
        : action.input.meetingVenue || null;
      state.counselName = action.input.counselName || null;
    },
    addBoardMemberOperation(state, action) {
      if (!state.boardMembers) state.boardMembers = [];
      const boardMember = {
        id: action.input.id,
        type: action.input.type,
        name: action.input.name,
        nationalityOrCountry: action.input.nationalityOrCountry,
        residenceOrCity: action.input.residenceOrCity,
        representative: action.input.representative || null,
        ethereumAddress: null,
        incorporationSignedAt: null,
      };
      state.boardMembers.push(boardMember);
      updatePersonalunionFlag(state);
    },
    updateBoardMemberOperation(state, action) {
      if (!state.boardMembers) state.boardMembers = [];
      const idx = state.boardMembers.findIndex((m) => m.id === action.input.id);
      if (idx === -1)
        throw new BoardMemberNotFoundError(
          `Board member ${action.input.id} not found`,
        );
      const member = state.boardMembers[idx];
      if (action.input.type) member.type = action.input.type;
      if (action.input.name) member.name = action.input.name;
      if (action.input.nationalityOrCountry)
        member.nationalityOrCountry = action.input.nationalityOrCountry;
      if (action.input.residenceOrCity)
        member.residenceOrCity = action.input.residenceOrCity;
      if (
        action.input.representative !== undefined &&
        action.input.representative !== null
      )
        member.representative = action.input.representative;
      updatePersonalunionFlag(state);
    },
    removeBoardMemberOperation(state, action) {
      if (!state.boardMembers) state.boardMembers = [];
      const idx = state.boardMembers.findIndex((m) => m.id === action.input.id);
      if (idx === -1)
        throw new BoardMemberNotFoundError(
          `Board member ${action.input.id} not found`,
        );
      state.boardMembers.splice(idx, 1);
      updatePersonalunionFlag(state);
    },
    copyFoundingMembersToBoardOperation(state) {
      state.boardMembers = state.members.map((member) => ({
        id: member.id,
        type: member.type,
        name: member.name,
        nationalityOrCountry: member.nationalityOrCountry,
        residenceOrCity: member.residenceOrCity,
        representative: member.representative || null,
        ethereumAddress: null,
        incorporationSignedAt: null,
      }));
      updatePersonalunionFlag(state);
    },
  };
