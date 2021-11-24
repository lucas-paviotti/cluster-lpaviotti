let mongoose = require('mongoose');
const usuariosCollection = 'usuarios';

const UsuarioEsquema = mongoose.Schema({
    username: {type: String, require: true},
    password: {type: String, require: true},
    email: {type: String, require: true},
    firstName: {type: String, require: true},
    lastName: {type: String, require: true}
});

module.exports = {
    UsuarioModelo: mongoose.model(usuariosCollection, UsuarioEsquema)
}