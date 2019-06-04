var express = require('express');

var fileUpload = require('express-fileupload');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fs = require('fs');


//default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleción no válida',
            errors: { message: 'Tipo de coleción no válida' }
        });
    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Seleccionar una imagen' }
        });

    };

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Extensiones válidas: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: { err }

            });

        }



        subirPorTipo(tipo, id, nombreArchivo, res);
    });

});



function subirPorTipo(tipo, id, nombreArchivo, res) {
    var existe = false;

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }

                });

            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: { err }

                    });

                }
                usuarioActualizado.password = ':)';

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    existe: existe,
                    usuarioActualizado: usuarioActualizado
                })

            })

        });

    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }

                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: { err }

                    });

                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    existe: existe,
                    medicoActualizado: medicoActualizado
                })

            })

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }

                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al mover archivo',
                        errors: { err }

                    });

                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    existe: existe,
                    hospitalActualizado: hospitalActualizado
                })

            })

        });
    }


}


module.exports = app;