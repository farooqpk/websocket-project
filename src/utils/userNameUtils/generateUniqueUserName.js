const { uniqueNamesGenerator, names } = require("unique-names-generator");


module.exports.generateUniqueUserName=()=>{
    const config = {
      dictionaries: [names],
    };
    return uniqueNamesGenerator(config);
  }