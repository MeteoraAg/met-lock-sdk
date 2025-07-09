import { PublicKey } from "@solana/web3.js";
import {
  BASE_SEED,
  ESCROW_METADATA_SEED,
  ESCROW_SEED,
  LOCK_PROGRAM_ID,
  ROOT_ESCROW_SEED,
} from "../constants";
import { encodeU64 } from "./common";

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

export function deriveRootEscrow(
  base: PublicKey,
  mint: PublicKey,
  version: number
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(ROOT_ESCROW_SEED),
      base.toBuffer(),
      mint.toBuffer(),
      encodeU64(version),
    ],
    LOCK_PROGRAM_ID
  )[0];
}

export function deriveBase(
  rootEscrow: PublicKey,
  recipient: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BASE_SEED), rootEscrow.toBuffer(), recipient.toBuffer()],
    LOCK_PROGRAM_ID
  )[0];
}
