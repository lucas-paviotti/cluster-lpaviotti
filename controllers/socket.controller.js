const { ProductoModelo } = require('../models/Producto');
const { MensajeModelo } = require('../models/Mensaje');
const {normalize, schema} = require('normalizr');

const authorSchema = new schema.Entity('author',{},{idAttribute: 'id'});
const mensajesSchema = new schema.Entity('mensajes',{
    author: authorSchema
},{idAttribute: '_id'});

const emitProductoSocket = async (socket) => {
    try {
        let productos = await ProductoModelo.find({});
        socket.emit('listaProductos', productos);
    }
    catch(e) {
        throw `No se pudieron enviar los productos a traves de websocket: ${e}`;
    }
}

const nuevoProductoSocket = async (socket, data) => {
    try {
        let { title, price, thumbnail } = data;
        
        const nuevoProducto = new ProductoModelo({
            title: title,
            price: price,
            thumbnail: thumbnail
        });
    
        await nuevoProducto.save();            
    }
    catch(e) {
        throw `Error al agregar producto a través de websocket: ${e}`;
    }
    finally {
        let productos = await ProductoModelo.find({});
        socket.emit('listaProductos', productos);
    }
}

const emitMensajeSocket = async (socket) => {
    try {
        let mensajes = await MensajeModelo.find({});
        const parsedMessages = mensajes.map((m) => {
            return {
                author: {
                    id: m.author.id,
                    nombre: m.author.nombre,
                    apellido: m.author.apellido,
                    edad: m.author.edad,
                    alias: m.author.alias,
                    avatar: m.author.avatar
                },
                _id: m._id.toString(),
                date: m.date,
                text: m.text
            };
        });

        const normalizedData = normalize(parsedMessages, [mensajesSchema]);
        
        const longAntes = JSON.stringify(mensajes).length;
        const longDespues = JSON.stringify(normalizedData).length;

        const compresion = Math.round((longAntes - longDespues) /  longAntes * 100);

        socket.emit('nuevoMensaje', {normalizedData, compresion});
    }
    catch(e) {
        throw `No se pudieron enviar los mensajes a traves de websocket: ${e}`;
    }
}

const nuevoMensajeSocket = async (socket, data) => {
    try {
        let { email, nombre, apellido, edad, alias, avatar, date, text } = data;

        const nuevoMensaje = new MensajeModelo({
            author: {
                id: email,
                nombre: nombre,
                apellido: apellido,
                edad: edad,
                alias: alias,
                avatar: avatar,
            },
            date: date,
            text: text
        });

        await nuevoMensaje.save();
    }
    catch(e) {
        throw `Error al agregar mensaje a través de websocket: ${e}`;
    }
    finally {
        let mensajes = await MensajeModelo.find({});
        const parsedMessages = mensajes.map((m) => {
            return {
                author: {
                    id: m.author.id,
                    nombre: m.author.nombre,
                    apellido: m.author.apellido,
                    edad: m.author.edad,
                    alias: m.author.alias,
                    avatar: m.author.avatar
                },
                _id: m._id.toString(),
                date: m.date,
                text: m.text
            };
        });

        const normalizedData = normalize(parsedMessages, [mensajesSchema]);
        
        const longAntes = JSON.stringify(mensajes).length;
        const longDespues = JSON.stringify(normalizedData).length;

        const compresion = Math.round((longAntes - longDespues) /  longAntes * 100);

        socket.emit('nuevoMensaje', {normalizedData, compresion});
    }
}

module.exports = {
    emitProductoSocket,
    nuevoProductoSocket,
    emitMensajeSocket,
    nuevoMensajeSocket
}