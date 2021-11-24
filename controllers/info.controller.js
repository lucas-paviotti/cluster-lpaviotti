const numCPUs = require('os').cpus().length;

const infoListar = async (req, res) => {
    try {
        let info = [
            {
                nombre: 'Argumentos de entrada',
                detalle: process.argv
            },
            {
                nombre: 'Path de ejecución',
                detalle: process.cwd()
            },
            {
                nombre: 'Nombre de la plataforma (OS)',
                detalle: process.platform
            },
            {
                nombre: 'Process ID',
                detalle: process.pid
            },
            {
                nombre: 'Version de node.js',
                detalle: process.version
            },
            {
                nombre: 'Carpeta corriente',
                detalle: process.pid
            },
            {
                nombre: 'Uso de memoria',
                detalle: process.memoryUsage().heapTotal
            },
            {
                nombre: 'Procesadores',
                detalle: numCPUs
            },
        ];
        
        res.render('info', { listaInfo: JSON.parse(JSON.stringify(info, null, 4)) });
    }
    catch(e) {
        throw `No se pudieron renderizar los datos: ${e}`;
    }
}

module.exports = {
    infoListar
}