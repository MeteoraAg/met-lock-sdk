export const encodeU64 = (num: number): Buffer => {
  const buf = Buffer.alloc(8);
  buf.writeBigUint64LE(BigInt(num));
  return buf;
};
