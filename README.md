# Meteora Lock SDK

A Typescript SDK for interacting with the Lock Program on Meteora.

## Overview

This SDK provides a set of tools and methods to interact with the [Meteora Lock Program](https://github.com/jup-ag/jup-lock). It enables developers to easily lock vest tokens.

## Installation

```bash
npm install @meteora-ag/met-lock-sdk
# or
pnpm install @meteora-ag/met-lock-sdk
# or
yarn add @meteora-ag/met-lock-sdk
```

## Initialization

```typescript
import { Connection } from "@solana/web3.js";
import { LockClient } from "@meteora-ag/met-lock-sdk";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const client = new LockClient(connection, "confirmed");
```

## Usage

Refer to the [docs](./docs.md) for how to use the functions.

## Flow

The generic flow of how Lock works is as follows:

1. Create and fund a vesting escrow using `createVestingEscrowV2`.
2. Users can claim the escrow using `claimV2`.

## Program Address

- Mainnet-beta: `LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`
- Devnet: `LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`
