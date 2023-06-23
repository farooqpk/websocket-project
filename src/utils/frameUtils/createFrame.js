module.exports.createFrame = (data) => {
  const payload = JSON.stringify(data);

  // Calculate the length of the payload in bytes
  const payloadByteLength = Buffer.byteLength(payload);

  // payload offset means the starting positon of the payload in the buffer frame
  let payloadBytesOffset = 2;

  // Check if the payload length exceeds 125 bytes and less than 65535 bytes
  if (payloadByteLength > 125) {
    // The length cannot fit in 1 byte, so increase the offset to accommodate 2 bytes
    payloadBytesOffset += 2;
  } else if (payloadByteLength > 65535) {
    // The length value cannot fit in 2 bytes, so increase the offset to accommodate 8 bytes
    payloadBytesOffset += 8;
  }
  

// this is common for all condition
  // Create a buffer by adding both payloadbytesoffset and payloadlength
  const buffer = Buffer.alloc(payloadBytesOffset + payloadByteLength);
  // Write the first byte of the frame (it contain opcodes etc..)
  buffer.writeUInt8(0x81, 0)


  if (payloadByteLength <= 125) {
    //  we setup 2nd postion in the buffer to start the payload (our default offset=2)
    buffer.writeUint8(payloadByteLength, 1);
  } else if (payloadByteLength === 126) {
    // Write the actual payload length as a 16-bit unsigned integer in the 2nd index(3rd postion) of the buffer
    buffer.writeUInt16BE(payloadByteLength, 2);
  } else if (payloadByteLength === 127) {
    // Write the actual payload length as a 64-bit unsigned integer
    buffer.writeBigUInt64BE(BigInt(payloadByteLength), 2);
  }

  // Write the payload into the buffer at the appropriate offset
  buffer.write(payload, payloadBytesOffset);

  return buffer;
};
