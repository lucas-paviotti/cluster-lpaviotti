let { ProductoModelo } = require('../models/Producto');
const generador = require('../generador/productos');

const productoVista = async (req, res) => {
    try {
        let productos = await ProductoModelo.find({});
        res.render('productos', { listaProductos: JSON.parse(JSON.stringify(productos, null, 4)) });
    }
    catch(e) {
        throw `No se pudieron renderizar los productos: ${e}`;
    }
}

const productoVistaTest = async (req, res) => {
    try {
        let productos = [];
        let cant = req.query.cant || 10;
        for (let i = 0; i < cant; i++) {
            productos.push(generador.get());
        }
        res.render('productos', { listaProductos: JSON.parse(JSON.stringify(productos, null, 4)) });
    }
    catch(e) {
        throw `No se pudieron renderizar los productos: ${e}`;
    }
}

module.exports = {
    productoVista,
    productoVistaTest
}