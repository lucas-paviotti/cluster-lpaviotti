let { ProductoModelo } = require('../models/Producto');

const apiProductosListar = async (req, res) => {
    try {
        let producto = await ProductoModelo.find({});
        if (producto.length) {
            res.status(200).json(producto);
        } else {
            res.status(404).json({error: 'No hay productos.'});
        }
    }
    catch(e) {
        res.status(500).json({error: 'Error al buscar documentos.'});
        throw `Error al buscar documentos: ${e}`;
    }
}

const apiProductosListarId = async (req, res) => {
    try {
        let { id } = req.params;

        let producto = await ProductoModelo.find({_id: id});

        if (producto.length) {
            res.status(200).json(producto);
        } else {
            res.status(404).json({error: 'No se encontró producto con ese ID.'});
        }
    }
    catch(e) {
        res.status(500).json({error: 'El formato de ID es incorrecto.'});
        throw `Error al buscar documento: ${e}`;
    }
}

const apiProductosGuardar = async (req, res) => {
    try {
        let { title, price, thumbnail } = req.body;
        
        const nuevoProducto = new ProductoModelo({
            title: title,
            price: price,
            thumbnail: thumbnail
        });

        await nuevoProducto.save();
        
        res.status(200).json(nuevoProducto);
    }
    catch(error) {
        res.status(500).json({error: 'No se pudo agregar el producto.'});
        throw `Error al agregar documento: ${e}`;
    }
}

const apiProductosActualizar = async (req, res) => {
    try {
        let { id } = req.params;
        let { title, price, thumbnail } = req.body;

        let producto = await ProductoModelo.find({_id: id});

        if (producto.length) {
            await ProductoModelo.updateOne({_id: id}, {title: title, price: price, thumbnail: thumbnail});
            res.status(200).json(producto);
        } else {
            res.status(404).json({error: 'No se encontró producto con ese ID.'});
        }
    }
    catch(e) {
        res.status(500).json({error: 'No se pudo editar el producto o el formato de ID es incorrecto.'});
        throw `Error al editar documento: ${e}`;
    }
}

const apiProductosBorrar = async (req, res) => {
    try {
        let { id } = req.params;

        let producto = await ProductoModelo.find({_id: id});

        if (producto.length) {
            await ProductoModelo.deleteOne({_id: id});
            res.status(200).json(producto);
        } else {
            res.status(404).json({error: 'No se encontró producto con ese ID.'});
        }
    }
    catch(e) {
        res.status(500).json({error: 'No se pudo eliminar el producto o el formato de ID es incorrecto.'});
        throw `Error al eliminar documento: ${e}`;
    }
}

module.exports = {
    apiProductosListar,
    apiProductosListarId,
    apiProductosGuardar,
    apiProductosActualizar,
    apiProductosBorrar
}