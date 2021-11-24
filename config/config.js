require('dotenv').config()

const { 
    PORT,
    FBCLIENTID, 
    FBCLIENTSECRET,
    MODE
} = process.env;

module.exports = {
    PORT,
    FBCLIENTID, 
    FBCLIENTSECRET,
    MODE
}