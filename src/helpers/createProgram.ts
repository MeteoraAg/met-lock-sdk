import { Commitment, Connection, Keypair } from "@solana/web3.js";
import { LockProgram } from "../types";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Locker } from "../idl/idl";
import LockerIDL from "../idl/idl.json";

export function createLockProgram(
  connection: Connection,
  commitment: Commitment = "confirmed"
): LockProgram {
  const defaultKeypair = Keypair.generate();
  const wallet = new Wallet(defaultKeypair)
  const provider = new AnchorProvider(connection, wallet, {
    commitment,
  });
  const program = new Program<Locker>(LockerIDL, provider);

  return program;
}
