import {
  AccountMeta,
  Commitment,
  Connection,
  Transaction,
} from "@solana/web3.js";
import {
  CreateRootEscrowParams,
  CreateVestingEscrowMetadataParams,
  CreateVestingEscrowParams,
  LockProgram,
  RemainingAccountsType,
} from "./types";
import { createLockProgram } from "./helpers";
import { deriveEscrow, deriveRootEscrow } from "./helpers/accounts";
import {
  getOrCreateATAInstruction,
  RemainingAccountsBuilder,
  TokenExtensionUtil,
} from "./helpers/token";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export class LockClient {
  program: LockProgram;
  private commitment: Commitment;
  private connection: Connection;

  constructor(connection: Connection, commitment: Commitment) {
    this.program = createLockProgram(connection, commitment);
    this.connection = connection;
    this.commitment = commitment;
  }

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

  async createVestingEscrowFromRoot() {}

  async fundRootEscrow() {}

  async updateVestingEscrowReceipient() {}

  async claim() {}

  async claimV2() {}

  async cancelVestingEscrow() {}

  async closeVestingEscrow() {}
}
