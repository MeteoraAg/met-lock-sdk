import { Commitment, Connection, Transaction } from "@solana/web3.js";
import { CreateVestingEscrowMetadataParams, LockProgram } from "./types";
import { createLockProgram } from "./helpers";
import { deriveEscrow } from "./helpers/accounts";
import { getOrCreateATAInstruction } from "./helpers/token";

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
}
