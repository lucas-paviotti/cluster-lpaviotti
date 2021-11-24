const { Router } = require('express');
const { getSignup, postSignup, failedSignup } = require('../controllers/signup.controller');
const { UsuarioModelo } = require('../models/Usuario');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { createHash } = require('../utils/utils');

const signupRouter = Router();

passport.use('signup', new LocalStrategy({
        passReqToCallback: true
    },
    (req, username, password, done) => {
        UsuarioModelo.findOne({'username': username}, (err,user) => {
            if (err) {
                console.log('Error en signup:' + err);
                return done(err);
            }
            if (user) {
                console.log('Usuario ya existe');
                return done(null, false, console.log('message', 'Usuario ya existe'));
            } else {
                const nuevoUsuario = new UsuarioModelo({
                    username: username,
                    password: createHash(password),
                    email: req.body.email,
                    firstname: req.body.firstName,
                    lastname: req.body.lastName 
                });
                nuevoUsuario.save((err) => {
                    if (err) {
                        console.log('Error al guardar usuario:' + err);
                        throw err;
                    }
                    console.log('Registro de usuario exitoso');
                    return done(null, nuevoUsuario)
                });
            }
        })
    }
));

signupRouter.get('/', getSignup);
signupRouter.post('/', passport.authenticate('signup', {failureRedirect: '/signup/failed'}), postSignup);
signupRouter.get('/failed', failedSignup);

module.exports = {
    signupRouter
}