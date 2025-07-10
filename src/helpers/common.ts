import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
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

  const accountData = await program.account[accountType].fetchNullable(address);

  if (accountData === null) {
    throw new Error(
      `Account of type '${accountType}' not found at address: ${address.toBase58()}`
    );
  }

  return accountData as T;
}

/**
 * Calculate total locked vesting amount
 * @param cliffUnlockAmount - Amount unlocked at cliff
 * @param amountPerPeriod - Amount unlocked per period
 * @param numberOfPeriod - Total number of periods
 * @returns Total locked vesting amount
 * formula: total_locked_vesting_amount = cliff_unlock_amount + (amount_per_period * number_of_period)
 */
export const calculateTotalLockedVestingAmount = (
  cliffUnlockAmount: BN,
  amountPerPeriod: BN,
  numberOfPeriod: BN
): BN => {
  return cliffUnlockAmount.add(amountPerPeriod.mul(numberOfPeriod));
};
