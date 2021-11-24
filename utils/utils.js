const util = require('util'); 
const bCrypt = require('bcrypt');

const print = (obj) => {
    console.log(util.inspect(obj, false, 12, true));
}

const createHash = (password) => {
    return bCrypt.hashSync(password, 10);
}

const isValidPassword = (user, password) => {
    return bCrypt.compareSync(password, user.password);
}

module.exports = {
    print,
    createHash,
    isValidPassword
}