const { Router } = require('express');
const { infoListar } = require('../controllers/info.controller');

const infoRouter = Router();

infoRouter.get('/', infoListar);

module.exports = {
    infoRouter
}