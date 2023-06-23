

module.exports.unmask = (payload, maskingKey) => {
  
  const result = Buffer.alloc(payload.byteLength);

  for (let i = 0; i < payload.byteLength; ++i) {
    const j = i % 4;
    const maskingKeyByteShift = j === 3 ? 0 : (3 - j) << 3;
    const maskingKeyByte =
      (maskingKeyByteShift === 0
        ? maskingKey
        : maskingKey >>> maskingKeyByteShift) & 0b11111111;
    const transformedByte = maskingKeyByte ^ payload.readUInt8(i);
    result.writeUInt8(transformedByte, i);
  }
  return result;
};
