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
  const defaultWallet = {
    publicKey: defaultKeypair.publicKey,
    signTransaction: async (tx: any) => {
      throw new Error("This is a read-only wallet - cannot sign transactions");
    },
    signAllTransactions: async (txs: any[]) => {
      throw new Error("This is a read-only wallet - cannot sign transactions");
    },
    payer: defaultKeypair,
  } as Wallet;

  const provider = new AnchorProvider(connection, defaultWallet, {
    commitment,
  });
  const program = new Program<Locker>(LockerIDL, provider);

  return program;
}
