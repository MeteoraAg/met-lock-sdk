# Lock SDK: Function Documentation

## Table of Contents

- [Core Functions](#core-functions)

  - [createVestingEscrowV2](#createVestingEscrowV2)
  - [claimV2](#claimV2)
  - [createVestingEscrowMetadata](#createVestingEscrowMetadata)

- [State Functions](#state-functions)

  - [getRootEscrow](#getRootEscrow)
  - [getEscrow](#getEscrow)

- [Helper Functions](#helper-functions)

  - [deriveEscrow](#deriveEscrow)
  - [deriveEscrowMetadata](#deriveEscrowMetadata)

---

### Core Functions

#### createVestingEscrowV2

Creates a vesting escrow. This function is a v2 function of `createVestingEscrow`.

#### Function

```typescript
async createVestingEscrowV2(createVestingEscrowV2Params: CreateVestingEscrowParams): Promise<Transaction>
```

#### Parameters

```typescript
interface CreateVestingEscrowParams {
  base: PublicKey; // The base address
  sender: PublicKey; // The sender address
  payer: PublicKey; // The payer address
  tokenMint: PublicKey; // The token mint address
  vestingStartTime: BN; // The vesting start time
  cliffTime: BN; // The cliff time
  frequency: BN; // The frequency
  cliffUnlockAmount: BN; // The cliff unlock amount
  amountPerPeriod: BN; // The amount per period
  numberOfPeriod: BN; // The number of period
  recipient: PublicKey; // The recipient address
  updateRecipientMode: number; // The update recipient mode
  cancelMode: number; // The cancel mode
  tokenProgram: PublicKey; // The token program address
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const base = Keypair.generate();
const currentBlockTime = await getCurrentBlockTime(program.provider.connection);
const cliffTime = new BN(currentBlockTime).add(new BN(5));

const transaction = await client.createVestingEscrowV2({
  base: new PublicKey("base1234567890abcdefghijklmnopqrstuvwxyz"),
  sender: new PublicKey("sender1234567890abcdefghijklmnopqrstuvwxyz"),
  payer: new PublicKey("payer1234567890abcdefghijklmnopqrstuvwxyz"),
  tokenMint: new PublicKey("tokenMint1234567890abcdefghijklmnopqrstuvwxyz"),
  vestingStartTime: new BN(0),
  cliffTime,
  frequency: new BN(1),
  cliffUnlockAmount: new BN(100000),
  amountPerPeriod: new BN(50000),
  numberOfPeriod: new BN(2),
  recipient: new PublicKey("recipient1234567890abcdefghijklmnopqrstuvwxyz"),
  updateRecipientMode: UpdateRecipientMode.NONE,
  cancelMode: CancelMode.RECIPIENT_ONLY,
  tokenProgram: TOKEN_PROGRAM_ID,
});
```

#### Notes

- The `payer` and `feeVault` is required to sign the transaction.
- `UserShare` is an array of objects with `address` and `share`.
  - Minimum: At least 2 users must be included
  - Maximum: No more than 5 users can be included

---

#### claimV2

Claims the maximum amount from the vesting escrow.

#### Function

```typescript
async claimV2(claimV2Params: ClaimParams): Promise<Transaction>
```

#### Parameters

```typescript
interface ClaimParams {
  escrow: PublicKey; // The escrow address
  recipient: PublicKey; // The recipient address
  maxAmount: BN; // The maximum amount to claim
  payer: PublicKey; // The payer address
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const transaction = await client.claimV2({
  escrow: new PublicKey("escrow1234567890abcdefghijklmnopqrstuvwxyz"),
  recipient: new PublicKey("recipient1234567890abcdefghijklmnopqrstuvwxyz"),
  maxAmount: new BN(1000000000000000000),
  payer: new PublicKey("payer1234567890abcdefghijklmnopqrstuvwxyz"),
});
```

#### Notes

- The `payer` and `recipient` is required to sign the transaction.

---

#### createVestingEscrowMetadata

Creates a vesting escrow metadata.

#### Function

```typescript
async createVestingEscrowMetadata(createVestingEscrowMetadataParams: CreateVestingEscrowMetadataParams): Promise<Transaction>
```

#### Parameters

```typescript
interface ClaimParams {
  escrow: PublicKey; // The escrow address
  name: string; // The name of the vesting escrow
  description: string; // The description of the vesting escrow
  creatorEmail: string; // The email of the creator
  recipientEmail: string; // The email of the recipient
  creator: PublicKey; // The creator address
  payer: PublicKey; // The payer address
}
```

#### Returns

A transaction that can be signed and sent to the network.

#### Example

```typescript
const transaction = await client.claimV2({
  escrow: new PublicKey("escrow1234567890abcdefghijklmnopqrstuvwxyz"),
  name: "Test Vesting Escrow",
  description: "This is a test vesting escrow",
  creatorEmail: "test@test.com",
  recipientEmail: "test@test.com",
  creator: new PublicKey("creator1234567890abcdefghijklmnopqrstuvwxyz"),
  payer: new PublicKey("payer1234567890abcdefghijklmnopqrstuvwxyz"),
});
```

#### Notes

- The `payer` and `creator` is required to sign the transaction.

---

### State Functions

#### getRootEscrow

Gets the root escrow.

#### Function

```typescript
async getRootEscrow(rootEscrow: PublicKey): Promise<RootEscrow>
```

#### Parameters

```typescript
rootEscrow: PublicKey;
```

#### Returns

A root escrow.

#### Example

```typescript
const rootEscrow = await client.getRootEscrow(
  new PublicKey("rootEscrow1234567890abcdefghijklmnopqrstuvwxyz")
);
```

#### Notes

- Returns a `RootEscrow` object.

---

#### getEscrow

Gets the vesting escrow.

```typescript
async getEscrow(escrow: PublicKey): Promise<Escrow>
```

#### Parameters

```typescript
escrow: PublicKey;
```

#### Returns

A vesting escrow.

#### Example

```typescript
const escrow = await client.getEscrow(
  new PublicKey("escrow1234567890abcdefghijklmnopqrstuvwxyz")
);
```

#### Notes

- Returns a `Escrow` object.

---

### Helper Functions

#### deriveEscrow

Derives the escrow address.

#### Function

```typescript
async deriveEscrow(base: PublicKey): Promise<PublicKey>
```

#### Parameters

```typescript
base: PublicKey;
```

#### Returns

A escrow address.

#### Example

```typescript
const escrow = await client.deriveEscrow(
  new PublicKey("base1234567890abcdefghijklmnopqrstuvwxyz")
);
```

#### Notes

- Returns an `Escrow` PDA.

---

#### deriveEscrowMetadata

Derives the escrow metadata address.

#### Function

```typescript
async deriveEscrowMetadata(escrow: PublicKey): Promise<PublicKey>
```

#### Parameters

```typescript
escrow: PublicKey;
```

#### Returns

A escrow metadata address.

#### Example

```typescript
const escrowMetadata = await client.deriveEscrowMetadata(
  new PublicKey("base1234567890abcdefghijklmnopqrstuvwxyz")
);
```

#### Notes

- Returns an `EscrowMetadata` PDA.
