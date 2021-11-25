const { PORT, MODE } = require('./config/config');
const express = require('express');
const exphbs = require('express-handlebars');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { emitProductoSocket, nuevoProductoSocket, emitMensajeSocket, nuevoMensajeSocket } = require('./controllers/socket.controller');
const { apiRouter } = require('./routes/api.route');
const { productoRouter } = require('./routes/producto.route');
const { loginRouter } = require('./routes/login.route');
const { logoutRouter } = require('./routes/logout.route');
const { signupRouter } = require('./routes/signup.route');
const { infoRouter } = require('./routes/info.route');
const { randomsRouter } = require('./routes/randoms.route');
const { UsuarioFacebookModelo } = require('./models/UsuarioFacebook');
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

if (MODE == 'CLUSTER') {
    if (cluster.isMaster){
        console.log(`Cantidad de CPUs: ${numCPUs}`);
        console.log(`Master PID ${process.pid} is running`);
        for (let i=0; i<numCPUs; i++){
            cluster.fork();
        }
        cluster.on('exit', (worker, code, signal) => { 
            console.log(`Worker ${worker.process.pid} died`)
        });
    } else {
        const server = https.createServer(httpsOptions, app).listen(process.argv[2] || PORT, () => {
            console.log(`Servidor http escuchando en el puerto ${server.address().port}. `, `Process ID: ${process.pid}`);
            /* process.argv.forEach((val, index, array) => {
                process.stdout.write(index + ': ' + val + '\n');
            }); */
        });
        
        server.on("error", error => console.log(`Error en servidor ${error}`));

        const io = new Server(server);

        io.on("connection", async (socket) => {
            console.log('Escuchando socket');
        
            emitProductoSocket(socket);
            
            socket.on('nuevoProducto', async (data) => {
                nuevoProductoSocket(socket, data);
            });
        
            emitMensajeSocket(socket);
        
            socket.on('nuevoMensaje', async (data) => {
                nuevoMensajeSocket(socket, data);
            });
        });
    } 
} else {
    const server = https.createServer(httpsOptions, app).listen(process.argv[2] || PORT, () => {
        console.log(`Servidor http escuchando en el puerto ${server.address().port}. `, `Process ID: ${process.pid}`);
        /* process.argv.forEach((val, index, array) => {
            process.stdout.write(index + ': ' + val + '\n');
        }); */
    });

    server.on("error", error => console.log(`Error en servidor ${error}`));

    const io = new Server(server);

    io.on("connection", async (socket) => {
        console.log('Escuchando socket');
    
        emitProductoSocket(socket);
        
        socket.on('nuevoProducto', async (data) => {
            nuevoProductoSocket(socket, data);
        });
    
        emitMensajeSocket(socket);
    
        socket.on('nuevoMensaje', async (data) => {
            nuevoMensajeSocket(socket, data);
        });
    });
}

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


/*
OBJETO PARA PRUEBA:
{
    "title": "Juego de mesa Carcassonne",
    "price": 5840,
    "thumbnail": "https://http2.mlstatic.com/D_NQ_NP_824823-MLA45578263264_042021-O.webp"
}
*/

