let mongoose = require('mongoose');
const findOrCreate = require("mongoose-findorcreate");
const usuariosFacebookCollection = 'usuariosFacebook';

const UsuarioFacebookEsquema = mongoose.Schema({
    facebookId: {type: String, require: true},
    picture: {type: String, require: true},
    email: {type: String, require: true},
    displayName: {type: String, require: true}
});

UsuarioFacebookEsquema.plugin(findOrCreate);

module.exports = {
    UsuarioFacebookModelo: mongoose.model(usuariosFacebookCollection, UsuarioFacebookEsquema)
}