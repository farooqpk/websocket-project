const {unmask} = require('./unmask')


module.exports.parseFrame = (buffer, OPCODES) => {
  // take opcode from the first byte by performing a bitmasking AND operation with a mask value.
  const opcode = buffer[0] & 0x0f;
  if (opcode === OPCODES.close) {
    return OPCODES.close;
  } else if (OPCODES.text) {
    // Extract the payload length from the second byte.
    // we perform a bitwise AND operation with the mask value (0x7f) to extract these bits.
    const payloadLength = buffer[1] & 0x7f;

    // starting position of the payload
    // by default 2 index so 3rd position
    let offset = 2;

    if (payloadLength === 126) {
      offset += 2; // Increase offset by 2 for a payload length of 126 (4th index or 5th position).
    } else if (payloadLength === 127) {
      throw new Error("Payload length exceeds the maximum supported length");
    }

    // check if the payload is masked
    // To determine this, we get the first bit of the second byte:
    // 1. Shift the bits of the second byte to the right by 7 positions.
    // 2. Perform a bitwise AND operation to take the rightmost bit.
    // 3. Convert the result to a boolean.
    const isMasked = Boolean((buffer[1] >>> 7) & 0x01);

    if (isMasked) {
      // Increase offset by 4 for a masked payload (8th index or 9th position)
      offset += 4;
      const maskedPayload = buffer.slice(offset, offset + payloadLength);
      // masking key starts 4 bytes before the offset
      const maskingKey = buffer.slice(offset - 4, offset); 
      const unmaskedPayload = unmask(maskedPayload,maskingKey)
      return unmaskedPayload.toString("utf-8");
    }
  } else {
    return null;
  }
};
