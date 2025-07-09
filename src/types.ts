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

export type CreateRootEscrowParams = {
  base: PublicKey;
  tokenMint: PublicKey;
  creator: PublicKey;
  payer: PublicKey;
  maxClaimAmount: BN;
  maxEscrow: BN;
  version: BN;
};

export type CreateVestingEscrowParams = {
  base: PublicKey;
  sender: PublicKey;
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

export type CreateVestingEscrowFromRootParams = {
  rootEscrow: PublicKey;
  vestingStartTime: BN;
  cliffTime: BN;
  frequency: BN;
  cliffUnlockAmount: BN;
  amountPerPeriod: BN;
  numberOfPeriod: BN;
  updateRecipientMode: number;
  cancelMode: number;
  proof: Array<number>[];
  recipient: PublicKey;
  payer: PublicKey;
};

export type ClaimParams = {
  escrow: PublicKey;
  recipient: PublicKey;
  recipientToken: PublicKey;
  maxAmount: BN;
  payer: PublicKey;
};

export type CancelVestingPlanParams = {
  escrow: EscrowWithMetadata;
  signer: PublicKey;
};
