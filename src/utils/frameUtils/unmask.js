
module.exports.unmask = (payload, maskingKey) => {

  for (let i = 0; i < payload.length; i++) {
    payload[i] = payload[i] ^ maskingKey[i % 4]
  }
  return payload
};
