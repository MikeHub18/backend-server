var express = require('express');
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion');

var bcrypt = require('bcryptjs');

var Medico = require('../models/medico');


//===============================================
// Obtener todos los medicos
//===============================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    })
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        Medicos: medicos,
                        Total: conteo
                    });
                });




            })
});

//===============================================
// Actualizar medico
//===============================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            })
        };

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + 'no existe',
                errors: { message: 'El medico no existe' }
            })
        };

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario._id;
        medico.hospital = body.hospital._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                })
            }


            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuarioToken: req.usuario
            })
        });

    });

});

//===============================================
// Crear un nuevo medico
//===============================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;


    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });


    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            })
        };

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario

        });
    });

});

//===============================================
// Eliminar medico
//===============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            })
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no existe',
                errors: { message: 'Medico no existe' }
            })
        }

        res.status(200).json({
            ok: true,
            usuario: medicoBorrado,
            usuarioToken: req.usuario
        })
    })

});
module.exports = app;