const { Router } = require('express');
const { apiProductosListar, apiProductosListarId, apiProductosGuardar, apiProductosActualizar, apiProductosBorrar } = require('../controllers/api.controller');

const apiRouter = Router();

apiRouter.get('/productos/listar', apiProductosListar);
apiRouter.get('/productos/listar/:id', apiProductosListarId);
apiRouter.post('/productos/guardar/', apiProductosGuardar);
apiRouter.put('/productos/actualizar/:id', apiProductosActualizar);
apiRouter.delete('/productos/borrar/:id', apiProductosBorrar);

module.exports = {
    apiRouter
}