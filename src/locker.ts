import {
  AccountMeta,
  Commitment,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  ClaimParams,
  CreateRootEscrowParams,
  CreateVestingEscrowFromRootParams,
  CreateVestingEscrowMetadataParams,
  CreateVestingEscrowParams,
  Escrow,
  LockProgram,
  RemainingAccountsType,
  RootEscrow,
  TokenType,
} from "./types";
import {
  createLockProgram,
  deriveBase,
  deriveEscrow,
  deriveRootEscrow,
  getOrCreateATAInstruction,
  getTokenProgram,
  RemainingAccountsBuilder,
  TokenExtensionUtil,
  getAccountData,
} from "./helpers";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
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
      base,
      name,
      description,
      creatorEmail,
      recipientEmail,
      tokenMint,
      tokenProgram,
      creator,
      payer,
    } = createVestingEscrowMetadataParams;

    const escrow = deriveEscrow(base);

    const preInstructions = [];

    const { ataPubkey: creatorATA, ix: createCreatorATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        creator,
        payer,
        true,
        tokenProgram
      );

    if (createCreatorATAInstruction) {
      preInstructions.push(createCreatorATAInstruction);
    }

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
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  /**
   * Create root escrow
   * @param createRootEscrowParams
   * @returns Transaction
   */
  async createRootEscrow(
    createRootEscrowParams: CreateRootEscrowParams
  ): Promise<Transaction> {
    const {
      base,
      tokenMint,
      creator,
      payer,
      maxClaimAmount,
      maxEscrow,
      version,
    } = createRootEscrowParams;

    const rootEscrow = deriveRootEscrow(base, tokenMint, version.toNumber());

    const params = {
      maxClaimAmount,
      maxEscrow,
      version,
      root: new Array(32).fill(0) as number[],
    };

    return this.program.methods
      .createRootEscrow(params)
      .accountsPartial({
        base,
        rootEscrow,
        tokenMint,
        payer,
        creator,
      })
      .transaction();
  }

  /**
   * Create vesting escrow
   * @param createVestingEscrowParams
   * @returns Transaction
   */
  async createVestingEscrow(
    createVestingEscrowParams: CreateVestingEscrowParams
  ): Promise<Transaction> {
    const {
      base,
      sender,
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
    } = createVestingEscrowParams;

    const escrow = deriveEscrow(base);

    const preInstructions = [];

    const { ataPubkey: senderATA, ix: createSenderATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        sender,
        payer,
        true,
        tokenProgram
      );

    if (createSenderATAInstruction) {
      preInstructions.push(createSenderATAInstruction);
    }

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

    const params = {
      cliffTime,
      frequency,
      cliffUnlockAmount,
      amountPerPeriod,
      numberOfPeriod,
      updateRecipientMode,
      vestingStartTime,
      cancelMode,
    };

    return this.program.methods
      .createVestingEscrow(params)
      .accountsPartial({
        base,
        escrow,
        escrowToken: escrowATA,
        sender,
        senderToken: senderATA,
        recipient,
        tokenProgram,
      })
      .preInstructions(preInstructions)
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

    const { ataPubkey: senderATA, ix: createSenderATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        tokenMint,
        sender,
        payer,
        true,
        tokenProgram
      );

    if (createSenderATAInstruction) {
      preInstructions.push(createSenderATAInstruction);
    }

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

    return this.program.methods
      .createVestingEscrowV2(params, remainingAccountsInfo)
      .accountsPartial({
        base,
        escrow,
        tokenMint,
        escrowToken: escrowATA,
        sender,
        senderToken: senderATA,
        recipient,
        tokenProgram,
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  /**
   * Create vesting escrow from root
   * @param createVestingEscrowFromRootParams
   * @returns Transaction
   */
  async createVestingEscrowFromRoot(
    createVestingEscrowFromRootParams: CreateVestingEscrowFromRootParams
  ): Promise<Transaction> {
    const {
      rootEscrow,
      vestingStartTime,
      cliffTime,
      frequency,
      cliffUnlockAmount,
      amountPerPeriod,
      numberOfPeriod,
      updateRecipientMode,
      cancelMode,
      recipient,
      proof,
      payer,
    } = createVestingEscrowFromRootParams;

    const rootEscrowState = await this.getRootEscrow(rootEscrow);

    const base = deriveBase(rootEscrow, recipient);

    const escrow = deriveEscrow(base);

    const tokenProgram = getTokenProgram(rootEscrowState.tokenProgramFlag);

    const preInstructions = [];

    const { ataPubkey: escrowATA, ix: escrowATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        rootEscrowState.tokenMint,
        escrow,
        payer,
        true,
        tokenProgram
      );

    if (escrowATAInstruction) {
      preInstructions.push(escrowATAInstruction);
    }

    const { ataPubkey: rootEscrowATA, ix: createRootEscrowATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        rootEscrowState.tokenMint,
        rootEscrow,
        payer,
        true,
        tokenProgram
      );

    if (createRootEscrowATAInstruction) {
      preInstructions.push(createRootEscrowATAInstruction);
    }

    let remainingAccountsInfo = null;
    let remainingAccounts: AccountMeta[] = [];
    if (rootEscrowState.tokenProgramFlag == TokenType.Token2022) {
      let inputTransferHookAccounts =
        await TokenExtensionUtil.getExtraAccountMetasForTransferHook(
          this.program.provider.connection,
          rootEscrowState.tokenMint,
          rootEscrowATA,
          escrowATA,
          payer,
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
      amountPerPeriod,
      numberOfPeriod,
      cliffUnlockAmount,
      updateRecipientMode,
      cancelMode,
    };

    return this.program.methods
      .createVestingEscrowFromRoot(params, proof, remainingAccountsInfo)
      .accountsPartial({
        rootEscrow,
        escrow,
        escrowToken: escrowATA,
        rootEscrowToken: rootEscrowATA,
        payer,
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  // TODO: Implement fundRootEscrow
  async fundRootEscrow() {}

  // TODO: Implement updateVestingEscrowReceipient
  async updateVestingEscrowReceipient() {}

  /**
   * Claim maximum amount from the vesting escrow
   * This instruction supports both splToken and token2022
   * @param claimParams
   * @returns Transaction
   */
  async claim(claimParams: ClaimParams): Promise<Transaction> {
    const { escrow, recipient, maxAmount, payer } = claimParams;

    const escrowState = await this.getEscrow(escrow);

    const tokenProgram = getTokenProgram(escrowState.tokenProgramFlag);

    const preInstructions = [];

    const { ataPubkey: escrowATA, ix: escrowATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        escrowState.tokenMint,
        escrow,
        payer,
        true,
        tokenProgram
      );

    if (escrowATAInstruction) {
      preInstructions.push(escrowATAInstruction);
    }

    const { ataPubkey: recipientATA, ix: recipientATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        escrowState.tokenMint,
        recipient,
        payer,
        true,
        tokenProgram
      );

    if (recipientATAInstruction) {
      preInstructions.push(recipientATAInstruction);
    }

    return this.program.methods
      .claim(maxAmount)
      .accountsPartial({
        escrow,
        escrowToken: escrowATA,
        recipient,
        recipientToken: recipientATA,
        tokenProgram,
      })
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

    const { ataPubkey: escrowATA, ix: escrowATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        escrowState.tokenMint,
        escrow,
        payer,
        true,
        tokenProgram
      );

    if (escrowATAInstruction) {
      preInstructions.push(escrowATAInstruction);
    }

    const { ataPubkey: recipientATA, ix: recipientATAInstruction } =
      await getOrCreateATAInstruction(
        this.program.provider.connection,
        escrowState.tokenMint,
        recipient,
        payer,
        true,
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
        tokenMint: escrowState.tokenMint,
        escrow,
        escrowToken: escrowATA,
        recipient,
        recipientToken: recipientATA,
        memoProgram: MEMO_PROGRAM_ID,
        tokenProgram,
      })
      .preInstructions(preInstructions)
      .transaction();
  }

  // TODO: Implement cancelVestingEscrow
  async cancelVestingEscrow() {}

  // TODO: Implement closeVestingEscrow
  async closeVestingEscrow() {}
}
