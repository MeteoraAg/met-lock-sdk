import { IdlAccounts, Program, ProgramAccount } from "@coral-xyz/anchor";
import { Locker } from "./idl/idl";
import { PublicKey } from "@solana/web3.js";

export type LockProgram = Program<Locker>;

export type Escrow = IdlAccounts<Locker>["vestingEscrow"];
export type EscrowMetadata = IdlAccounts<Locker>["vestingEscrowMetadata"];
export type EscrowWithMetadata = ProgramAccount<Escrow> & {
  escrowMetadata?: EscrowMetadata;
  mint: PublicKey;
};

export enum TokenType {
  SPL = 0,
  Token2022 = 1,
}

export enum UpdateRecipientMode {
  NONE = 0,
  CREATOR_ONLY = 1,
  RECIPIENT_ONLY = 2,
  CREATOR_RECIPIENT = 3,
}

export enum CancelMode {
  NONE = 0,
  CREATOR_ONLY = 1,
  RECIPIENT_ONLY = 2,
  CREATOR_RECIPIENT = 3,
}

export type CreateVestingEscrowMetadataParams = {
  base: PublicKey;
  name: string;
  description: string;
  creatorEmail: string;
  recipientEmail: string;
  tokenMint: PublicKey;
  tokenProgram: PublicKey;
  creator: PublicKey;
  payer: PublicKey;
};

export type CancelVestingPlanParams = {
  escrow: EscrowWithMetadata;
  signer: PublicKey;
};
