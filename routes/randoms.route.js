const { Router } = require('express');
const { randomsGenerar } = require('../controllers/randoms.controller');

const randomsRouter = Router();

randomsRouter.get('/', randomsGenerar);

module.exports = {
    randomsRouter
}