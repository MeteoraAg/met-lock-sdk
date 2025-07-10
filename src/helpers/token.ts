import {
  addExtraAccountMetasForExecute,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  getTransferHook,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import {
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  OptionRemainingAccountsInfoData,
  RemainingAccountsAnchorType,
  RemainingAccountsSliceData,
  RemainingAccountsType,
  TokenType,
} from "../types";

export function getTokenProgram(tokenFlag: TokenType): PublicKey {
  return tokenFlag === TokenType.SPL ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;
}

export const getOrCreateATAInstruction = async (
  connection: Connection,
  tokenMint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  allowOwnerOffCurve = true,
  tokenProgram: PublicKey
): Promise<{ ataPubkey: PublicKey; ix?: TransactionInstruction }> => {
  const toAccount = getAssociatedTokenAddressSync(
    tokenMint,
    owner,
    allowOwnerOffCurve,
    tokenProgram
  );

  try {
    await getAccount(connection, toAccount);
    return { ataPubkey: toAccount, ix: undefined };
  } catch (e) {
    if (
      e instanceof TokenAccountNotFoundError ||
      e instanceof TokenInvalidAccountOwnerError
    ) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        payer,
        toAccount,
        owner,
        tokenMint,
        tokenProgram
      );

      return { ataPubkey: toAccount, ix };
    } else {
      /* handle error */
      console.error("Error::getOrCreateATAInstruction", e);
      throw e;
    }
  }
};

export function wrapSOLInstruction(
  from: PublicKey,
  to: PublicKey,
  amount: bigint
): TransactionInstruction[] {
  return [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount,
    }),
    new TransactionInstruction({
      keys: [
        {
          pubkey: to,
          isSigner: false,
          isWritable: true,
        },
      ],
      data: Buffer.from(new Uint8Array([17])),
      programId: TOKEN_PROGRAM_ID,
    }),
  ];
}

export function unwrapSOLInstruction(
  owner: PublicKey,
  receiver: PublicKey,
  allowOwnerOffCurve = true
): TransactionInstruction | null {
  const wSolATAAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    owner,
    allowOwnerOffCurve
  );
  if (wSolATAAccount) {
    const closedWrappedSolInstruction = createCloseAccountInstruction(
      wSolATAAccount,
      receiver,
      owner,
      [],
      TOKEN_PROGRAM_ID
    );
    return closedWrappedSolInstruction;
  }
  return null;
}

export class TokenExtensionUtil {
  public static async getExtraAccountMetasForTransferHook(
    connection: Connection,
    tokenMint: PublicKey,
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    tokenProgram: PublicKey
  ): Promise<AccountMeta[] | undefined> {
    let mint = await getMint(connection, tokenMint, "confirmed", tokenProgram);
    const transferHook = getTransferHook(mint);

    if (!transferHook) return undefined;

    const instruction = new TransactionInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      keys: [
        { pubkey: source, isSigner: false, isWritable: false },
        {
          pubkey: tokenMint,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: destination, isSigner: false, isWritable: false },
        { pubkey: owner, isSigner: false, isWritable: false },
        { pubkey: owner, isSigner: false, isWritable: false },
      ],
    });

    // Note:
    await addExtraAccountMetasForExecute(
      connection,
      instruction,
      transferHook.programId,
      source,
      tokenMint,
      destination,
      owner,
      0, // extra account must not depend on the amount (the amount will be changed due to slippage)
      "confirmed"
    );

    const extraAccountMetas = instruction.keys.slice(5);
    return extraAccountMetas.length > 0 ? extraAccountMetas : undefined;
  }
}

export class RemainingAccountsBuilder {
  private remainingAccounts: AccountMeta[] = [];
  private slices: RemainingAccountsSliceData[] = [];

  constructor() {}

  addSlice(
    accountsType: RemainingAccountsType,
    accounts?: AccountMeta[]
  ): this {
    if (!accounts || accounts.length === 0) return this;

    this.slices.push({
      accountsType: { [accountsType]: {} } as RemainingAccountsAnchorType,
      length: accounts.length,
    });
    this.remainingAccounts.push(...accounts);

    return this;
  }

  build(): [OptionRemainingAccountsInfoData, AccountMeta[] | undefined] {
    return this.slices.length === 0
      ? [null, undefined]
      : [{ slices: this.slices }, this.remainingAccounts];
  }
}
