import { IdlAccounts, Program, ProgramAccount } from "@coral-xyz/anchor";
import { Locker } from "./idl/idl";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type LockProgram = Program<Locker>;

export type RootEscrow = IdlAccounts<Locker>["rootEscrow"];
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

export enum RemainingAccountsType {
  TransferHookEscrow = "transferHookEscrow",
}

export type RemainingAccountsAnchorType = { transferHookEscrow: {} };

export type RemainingAccountsSliceData = {
  accountsType: RemainingAccountsAnchorType;
  length: number;
};

export type RemainingAccountsInfoData = {
  slices: RemainingAccountsSliceData[];
};

export type OptionRemainingAccountsInfoData = RemainingAccountsInfoData | null;

export type CreateVestingEscrowMetadataParams = {
  escrow: PublicKey;
  name: string;
  description: string;
  creatorEmail: string;
  recipientEmail: string;
  creator: PublicKey;
  payer: PublicKey;
};

export type CreateVestingEscrowParams = {
  base: PublicKey;
  sender: PublicKey;
  isSenderMultiSig: boolean;
  payer: PublicKey;
  tokenMint: PublicKey;
  vestingStartTime: BN;
  cliffTime: BN;
  frequency: BN;
  cliffUnlockAmount: BN;
  amountPerPeriod: BN;
  numberOfPeriod: BN;
  recipient: PublicKey;
  updateRecipientMode: number;
  cancelMode: number;
  tokenProgram: PublicKey;
};

export type ClaimParams = {
  escrow: PublicKey;
  recipient: PublicKey;
  maxAmount: BN;
  payer: PublicKey;
};
