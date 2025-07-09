import { Commitment, Connection } from "@solana/web3.js";
import { LockProgram } from "../types";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Locker } from "../idl/idl";
import LockerIDL from "../idl/idl.json";

export function createLockProgram(
  connection: Connection,
  commitment: Commitment = "confirmed"
): LockProgram {
  const provider = new AnchorProvider(connection, null as Wallet, {
    commitment,
  });
  const program = new Program<Locker>(LockerIDL, provider);

  return program;
}
