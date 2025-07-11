import {
  AccountMeta,
  Commitment,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  ClaimParams,
  CreateVestingEscrowMetadataParams,
  CreateVestingEscrowParams,
  Escrow,
  LockProgram,
  RemainingAccountsType,
  RootEscrow,
} from "./types";
import {
  createLockProgram,
  deriveEscrow,
  getOrCreateATAInstruction,
  getTokenProgram,
  RemainingAccountsBuilder,
  TokenExtensionUtil,
  getAccountData,
  deriveEscrowMetadata,
} from "./helpers";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { MEMO_PROGRAM_ID } from "./constants";

export class LockClient {
  program: LockProgram;
  private commitment: Commitment;
  private connection: Connection;

  constructor(connection: Connection, commitment: Commitment) {
    this.program = createLockProgram(connection, commitment);
    this.connection = connection;
    this.commitment = commitment;
  }

  /**
   * Get root escrow
   * @param rootEscrow
   * @returns RootEscrow
   */
  async getRootEscrow(rootEscrow: PublicKey): Promise<RootEscrow> {
    return getAccountData(rootEscrow, "rootEscrow", this.program);
  }

  /**
   * Get vesting escrow
   * @param escrow
   * @returns Escrow
   */
  async getEscrow(escrow: PublicKey): Promise<Escrow> {
    return getAccountData(escrow, "vestingEscrow", this.program);
  }

  /**
   * Create vesting escrow metadata
   * @param createVestingEscrowMetadataParams
   * @returns Transaction
   */
  async createVestingEscrowMetadata(
    createVestingEscrowMetadataParams: CreateVestingEscrowMetadataParams
  ): Promise<Transaction> {
    const {
      escrow,
      name,
      description,
      creatorEmail,
      recipientEmail,
      creator,
      payer,
    } = createVestingEscrowMetadataParams;

    const escrowMetadata = deriveEscrowMetadata(escrow);

    return this.program.methods
      .createVestingEscrowMetadata({
        name,
        description,
        creatorEmail,
        recipientEmail,
      })
      .accountsPartial({
        escrow,
        creator,
        payer,
        escrowMetadata,
      })
      .transaction();
  }

  /**
   * Create vesting escrow v2
   * @param createVestingEscrowV2Params
   * @returns Transaction
   */
  async createVestingEscrowV2(
    createVestingEscrowV2Params: CreateVestingEscrowParams
  ): Promise<Transaction> {
    const {
      base,
      sender,
      isSenderMultiSig,
      payer,
      tokenMint,
      vestingStartTime,
      cliffTime,
      frequency,
      cliffUnlockAmount,
      amountPerPeriod,
      numberOfPeriod,
      recipient,
      updateRecipientMode,
      cancelMode,
      tokenProgram,
    } = createVestingEscrowV2Params;

    const escrow = deriveEscrow(base);

    const preInstructions = [];

    const senderATA = getAssociatedTokenAddressSync(
      tokenMint,
      sender,
      isSenderMultiSig,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const { ataPubkey: escrowATA, ix: escrowATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        escrow,
        payer,
        true,
        tokenProgram
      );

    if (escrowATAInstruction) {
      preInstructions.push(escrowATAInstruction);
    }

    let remainingAccountsInfo = null;
    let remainingAccounts: AccountMeta[] = [];
    if (tokenProgram == TOKEN_2022_PROGRAM_ID) {
      let inputTransferHookAccounts =
        await TokenExtensionUtil.getExtraAccountMetasForTransferHook(
          this.program.provider.connection,
          tokenMint,
          senderATA,
          escrowATA,
          sender,
          TOKEN_2022_PROGRAM_ID
        );

      [remainingAccountsInfo, remainingAccounts] =
        new RemainingAccountsBuilder()
          .addSlice(
            RemainingAccountsType.TransferHookEscrow,
            inputTransferHookAccounts
          )
          .build();
    }

    const params = {
      vestingStartTime,
      cliffTime,
      frequency,
      cliffUnlockAmount,
      amountPerPeriod,
      numberOfPeriod,
      updateRecipientMode,
      cancelMode,
    };

    return await this.program.methods
      .createVestingEscrowV2(params, remainingAccountsInfo)
      .accountsPartial({
        base,
        senderToken: senderATA,
        recipient,
        tokenMint,
        sender,
        tokenProgram,
      })
      .remainingAccounts(remainingAccounts ? remainingAccounts : [])
      .preInstructions(preInstructions)
      .transaction();
  }

  /**
   * Claim maximum amount from the vesting escrow v2
   * This instruction supports both splToken and token2022
   * @param claimV2Params
   * @returns Transaction
   */
  async claimV2(claimV2Params: ClaimParams): Promise<Transaction> {
    const { escrow, recipient, maxAmount, payer } = claimV2Params;

    const escrowState = await this.getEscrow(escrow);

    const tokenProgram = getTokenProgram(escrowState.tokenProgramFlag);

    const preInstructions = [];

    const escrowATA = getAssociatedTokenAddressSync(
      escrowState.tokenMint,
      escrow,
      true,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const { ataPubkey: recipientATA, ix: recipientATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        escrowState.tokenMint,
        recipient,
        payer,
        false,
        tokenProgram
      );

    if (recipientATAInstruction) {
      preInstructions.push(recipientATAInstruction);
    }

    let remainingAccountsInfo = null;
    let remainingAccounts: AccountMeta[] = [];
    if (tokenProgram == TOKEN_2022_PROGRAM_ID) {
      let claimTransferHookAccounts =
        await TokenExtensionUtil.getExtraAccountMetasForTransferHook(
          this.program.provider.connection,
          escrowState.tokenMint,
          escrowATA,
          recipientATA,
          escrow,
          TOKEN_2022_PROGRAM_ID
        );

      [remainingAccountsInfo, remainingAccounts] =
        new RemainingAccountsBuilder()
          .addSlice(
            RemainingAccountsType.TransferHookEscrow,
            claimTransferHookAccounts
          )
          .build();
    }

    return this.program.methods
      .claimV2(maxAmount, remainingAccountsInfo)
      .accountsPartial({
        tokenProgram,
        tokenMint: escrowState.tokenMint,
        escrow,
        escrowToken: escrowATA,
        recipient,
        recipientToken: recipientATA,
        memoProgram: MEMO_PROGRAM_ID,
      })
      .remainingAccounts(remainingAccounts ? remainingAccounts : [])
      .preInstructions(preInstructions)
      .transaction();
  }
}
