/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import { SignForIncorporationInputSchema } from "../schema/zod.js";
import type { SignForIncorporationInput } from "../types.js";
import type { SignForIncorporationAction } from "./actions.js";

export const signForIncorporation = (input: SignForIncorporationInput) =>
  createAction<SignForIncorporationAction>(
    "SIGN_FOR_INCORPORATION",
    { ...input },
    undefined,
    SignForIncorporationInputSchema,
    "global",
  );
