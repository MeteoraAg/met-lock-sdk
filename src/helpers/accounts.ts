import { PublicKey } from "@solana/web3.js";
import {
  ESCROW_METADATA_SEED,
  ESCROW_SEED,
  LOCK_PROGRAM_ID,
} from "../constants";

export function deriveEscrow(base: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED), base.toBuffer()],
    LOCK_PROGRAM_ID
  )[0];
}

export function deriveEscrowMetadata(escrow: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_METADATA_SEED), escrow.toBuffer()],
    LOCK_PROGRAM_ID
  )[0];
}
