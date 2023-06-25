
module.exports.createFrame = (data) => {
  const payload = JSON.stringify(data);
  // Calculate the length of the payload in bytes
  const payloadByteLength = Buffer.byteLength(payload);

  const buffer = Buffer.alloc(payloadByteLength + 2);

  buffer.writeUInt8(0x81, 0);
  buffer.writeUInt8(payloadByteLength, 1);
  buffer.write(payload, 2);

  return buffer;
};
