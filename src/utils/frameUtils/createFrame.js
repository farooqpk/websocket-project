
module.exports.createFrame = (data) => {

  const payload = JSON.stringify(data);
  
  // Calculate the length of the payload in bytes
  const payloadByteLength = Buffer.byteLength(payload);
 
  // payload offset means the positon of the payload in the buffer frame
  let payloadBytesOffset = 2;

  // Check if the payload length exceeds 65535 bytes
  if (payloadByteLength > 65535) {
    // The length value cannot fit in 2 bytes
    payloadBytesOffset += 8;
  }
  // Check if the payload length exceeds 125 bytes
  else if (payloadByteLength > 125) {
    payloadBytesOffset += 2;
  }

  // Create a buffer with the appropriate size
  const buffer = Buffer.alloc(payloadBytesOffset + payloadByteLength);

  // Write the first byte of the frame
  buffer.writeUInt8(0b10000001, 0);
  // Write the second byte - actual payload size (if <= 125 bytes) or 126, or 127
  buffer[1] = payloadByteLength

  // Check if the payload length is 126
  if (payloadByteLength === 126) {
    // Write the actual payload length as a 16-bit unsigned integer
    buffer.writeUInt16BE(payloadByteLength, 2);
  }
  // Check if the payload length is 127
  else if (payloadByteLength === 127) {
    // Write the actual payload length as a 64-bit unsigned integer
    buffer.writeBigUInt64BE(BigInt(payloadByteLength), 2);
  }

  // Write the payload into the buffer at the appropriate offset
  buffer.write(payload, payloadBytesOffset);

  // Return the frame buffer
  return buffer;
};
