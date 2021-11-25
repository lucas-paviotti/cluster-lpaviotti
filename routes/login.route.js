const { Router } = require('express');
const { getLogin, postLogin, failedLogin } = require('../controllers/login.controller');
const { UsuarioFacebookModelo } = require('../models/UsuarioFacebook');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const { PORT, FBCLIENTID, FBCLIENTSECRET } = require('../config/config');

const loginRouter = Router();

passport.use(new FacebookStrategy({
    clientID: process.argv[3] || FBCLIENTID,
    clientSecret: process.argv[4] || FBCLIENTSECRET,
    callbackURL: `https://localhost:${process.argv[2] || PORT}/login/facebook/callback`,
    profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
  },
  function(accessToken, refreshToken, profile, done) {
    UsuarioFacebookModelo.findOrCreate({ facebookId: profile.id }, {email: profile._json.email, displayName: profile._json.name, picture: profile._json.picture.data.url}, function (err, user) {
        if (err) { return done(err); }
        return done(err, user);
    });
  }
));

loginRouter.get('/', getLogin);
loginRouter.post('/', passport.authenticate('login', {failureRedirect: '/login/failed'}), postLogin);
loginRouter.get('/facebook', passport.authenticate('facebook', {scope: [ "email" ],}));
loginRouter.get('/facebook/callback', passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login/failed'}));
loginRouter.get('/failed', failedLogin);

module.exports = {
    loginRouter
}