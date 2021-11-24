const { Router } = require('express');
const { productoVista, productoVistaTest } = require('../controllers/producto.controller');

const productoRouter = Router();

productoRouter.get('/vista', productoVista);
productoRouter.get('/vista-test', productoVistaTest)

module.exports = {
    productoRouter
}