const { unmask } = require("./unmask");


module.exports.parseFrame = (buffer, OPCODES) => {

  const firstByte = buffer.readUint8(0);
  const opcode = firstByte & 0b00001111; 

  if (opcode === OPCODES.close) {
    return;
  } else if (opcode === OPCODES.text) {
    const secondByte = buffer.readUInt8(1);
    let offset = 2;
    let payloadLength = secondByte & 0b01111111; 

    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      // If payload length is 127, it is represented in the next 8 bytes
      // which is larger than the Number type can accurately represent.
      // In this case, you may need to handle it differently or throw an error.
      throw new Error("Payload length exceeds the maximum supported length");
    }

    const isMasked = Boolean((secondByte >>> 7) & 0b00000001); // get first bit of a second byte

    if (isMasked) {
      const maskingKey = buffer.readUInt32BE(offset); // read 4-byte (32-bit) masking key
      offset += 4;
      const maskedPayload = buffer.subarray(offset, offset + payloadLength);
      const unmaskedPayload = unmask(maskedPayload, maskingKey);

      return unmaskedPayload.toString("utf-8");
    }

    return buffer.subarray(offset, offset + payloadLength).toString("utf-8");
  }

  return null;
};
