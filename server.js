const { PORT, MODE } = require('./config/config');
const express = require('express');
const exphbs = require('express-handlebars');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const { apiRouter } = require('./routes/api.route');
const { productoRouter } = require('./routes/producto.route');
const { loginRouter } = require('./routes/login.route');
const { logoutRouter } = require('./routes/logout.route');
const { signupRouter } = require('./routes/signup.route');
const { infoRouter } = require('./routes/info.route');
const { randomsRouter } = require('./routes/randoms.route');

const { ProductoModelo } = require('./models/Producto');
const { MensajeModelo } = require('./models/Mensaje');
const { UsuarioFacebookModelo } = require('./models/UsuarioFacebook');

const {normalize, schema} = require('normalizr');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const https = require('https');
const fs = require('fs'); 
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const httpsOptions = {
    key: fs.readFileSync('./sslcert/cert.key'),
    cert: fs.readFileSync('./sslcert/cert.pem')
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

app.use(session({
    secret: 'secreto',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        httpOnly: false,
        secure: false,
        maxAge: 600000 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter);
app.use('/productos', productoRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/signup', signupRouter);
app.use('/info', infoRouter);
app.use('/randoms', randomsRouter);

/* if (MODE == 'CLUSTER') {
    if (cluster.isMaster){
        console.log(`Cantidad de CPUs: ${numCPUs}`);
        console.log(`Master PID ${process.pid} is running`);
        for (let i=0; i<numCPUs; i++){
            cluster.fork();
        }
        cluster.on('exit', (worker, code, signal) => { 
            console.log(`Worker ${worker.process.pid} died`)
            cluster.fork();
        });
    } else {
        const server = https.createServer(httpsOptions, app).listen(process.argv[2] || PORT, () => {
            console.log(`Servidor http escuchando en el puerto ${server.address().port}. `, `Process ID: ${process.pid}`);
            process.argv.forEach((val, index, array) => {
                process.stdout.write(index + ': ' + val + '\n');
            });
        });
        server.on("error", error => console.log(`Error en servidor ${error}`));
    } 
} else {
    const server = https.createServer(httpsOptions, app).listen(process.argv[2] || PORT, () => {
        console.log(`Servidor http escuchando en el puerto ${server.address().port}. `, `Process ID: ${process.pid}`);
        process.argv.forEach((val, index, array) => {
            process.stdout.write(index + ': ' + val + '\n');
        });
    });
    server.on("error", error => console.log(`Error en servidor ${error}`));
} */

const server = https.createServer(httpsOptions, app).listen(process.argv[2] || PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}. `, `Process ID: ${process.pid}`);
    process.argv.forEach((val, index, array) => {
        process.stdout.write(index + ': ' + val + '\n');
    });
});
server.on("error", error => console.log(`Error en servidor ${error}`));

app.engine(
    "hbs",
    exphbs({
        extname: ".hbs",
        defaultLayout: "index",
        layoutsDir: `${__dirname}/views/layouts`,
        partialsDir: `${__dirname}/views/partials`
    })
);

app.set('views', './views');
app.set('view engine', 'hbs');

const mongoURI = 'mongodb://localhost:27017/ecommerce';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 1000
});
mongoose.connection.on("error", err => {
  console.log("err", err)
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose está conectado")
});

const authorSchema = new schema.Entity('author',{},{idAttribute: 'id'});
const mensajesSchema = new schema.Entity('mensajes',{
    author: authorSchema
},{idAttribute: '_id'});


passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    UsuarioFacebookModelo.findById(id, (err, user) => {
        done(err, user);
    });
});


app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('formulario', { nombre: req.user.displayName, email: req.user.email, picture: req.user.picture });
    } else {
        res.redirect('/login');
    }
});


const io = new Server(server);

io.on("connection", async (socket) => {
    console.log('Escuchando socket');

    try {
        let productos = await ProductoModelo.find({});
        socket.emit('listaProductos', productos);
    }
    catch(e) {
        throw `No se pudieron enviar los productos a traves de websocket: ${e}`;
    }
    
    socket.on('nuevoProducto', async (data) => {
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
    });

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

    socket.on('nuevoMensaje', async (data) => {
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
    });
});



/*
OBJETO PARA PRUEBA:
{
    "title": "Juego de mesa Carcassonne",
    "price": 5840,
    "thumbnail": "https://http2.mlstatic.com/D_NQ_NP_824823-MLA45578263264_042021-O.webp"
}
*/

