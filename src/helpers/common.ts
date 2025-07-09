import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Locker } from "../idl/idl";

export const encodeU64 = (num: number): Buffer => {
  const buf = Buffer.alloc(8);
  buf.writeBigUint64LE(BigInt(num));
  return buf;
};

export async function getAccountData<T>(
  accountAddress: PublicKey | string,
  accountType: keyof Program<Locker>["account"],
  program: Program<Locker>
): Promise<T> {
  const address =
    accountAddress instanceof PublicKey
      ? accountAddress
      : new PublicKey(accountAddress);

  return (await program.account[accountType].fetchNullable(address)) as T;
}
