const { Router } = require('express');
const { renderLogout } = require('../controllers/logout.controller');

const logoutRouter = Router();

logoutRouter.get('/', renderLogout);

module.exports = {
    logoutRouter
}