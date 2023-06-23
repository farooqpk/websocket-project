const crypto = require("crypto");


module.exports.generateAcceptValue = (acceptKey, GUID) => {
  // here crypto module create a hash object then update the object by concentrating acceptkey and GUID then compute a final digest of the hash and return as base64 string
  return crypto
    .createHash("sha1")
    .update(acceptKey + GUID)
    .digest("base64");
};
