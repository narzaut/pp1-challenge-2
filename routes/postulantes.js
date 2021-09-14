// Import dependencies
const express = require("express");
const Joi = require('joi');
const mysql = require('mysql');

//CREATE CONNECTION
const connection = mysql.createConnection({
	host: '64.225.47.18',
  user: 'mellitus',
  password: 'itecriocuarto2020',
  database: 'SindicatoCarneDB'
})
//DB CONNECTION
connection.connect(error => {
	if (error) throw error;
	console.log('Database connected')
})

// Import middlewares
const auth = require("../middleware/auth");
const { editor, viewer, poster } = require("../middleware/roles");

// Setup the router for express
const router = express.Router();

router.get('/', [auth, viewer] ,(req, res) => {
	const sql = 'SELECT * from postulante';

	connection.query(sql, (err, results) => {
		if (err) throw err;
		if (results.length > 0){
			res.json(results);
		}else {
			res.status(404).send('No hay postulantes en la base de datos.')
		}
	})
})

router.get('/:id', [auth, viewer], (req, res) => {
	const schema = Joi.number().integer().min(0).required();
	const validateId = schema.validate(req.params.id)
	if (validateId.error) {
		res.status(400).send(validateId.error.details[0].message)
		return;
	}
	const sql = `SELECT * FROM postulante WHERE idPostulante = ${validateId.value}`;
	connection.query(sql, (err, results) => {
		if (err) throw err;
		if (results.length > 0){
			res.json(results);
		}else {
			res.status(404).send('El postulante no esta cargado en la base de datos.')
		}
	})
})

router.post('/', [auth, poster], (req, res) => {
	const sql = 'INSERT INTO postulante SET ?';
	
	const postulante = validatePostulante(req.body)
	if (postulante.error){
		res.status(400).send(postulante.error.details[0].message);
		return;
	}

	const isDuplicate = () => {
		return new Promise((resolve, reject) => {
			connection.query(`SELECT * FROM postulante WHERE dniPostulante = ${req.body.dniPostulante}`, (err, results) => {	
				if (err) throw err;
				if (results.length > 0) {
					resolve(true)

				} else{
					resolve(false)
				}
			})

		})
	}

	async function addToDb () {
		try {
			const duplicate = await isDuplicate();
			if (duplicate == false){
				connection.query(sql, postulante.value, err => {
					if (err) throw err;
					res.status(200).send({
						message: 'Postulante agregado',
						status:200,
						success: true,
						payload: postulante.value
					})	
					console.log('added to db')
				})
			} else{
				res.status(400).send({
					message: 'El postulante ya existe en la base de datos',
					status:400,
					success: false,
					payload: postulante.value
				})
				console.log('El postulante ya existe en la base de datos')
			}
		} catch {
			console.log('ERRROR	')
		}
		
	}
	addToDb()
})

const validatePostulante = (postulante) => {
	const schema = Joi.object({
		nombrePostulante: Joi.string().min(3).max(250).required(),
		dniPostulante: Joi.string().min(7).max(8).required(),
		fingresoPostulante: Joi.date().required(),
		fnacimientoPostulante: Joi.date().required(),
		estadocivil: Joi.number().integer().min(0).max(1).required(),
		empresaPostulante: Joi.string().max(250).required(),
		activoPostulante: Joi.number().integer().min(0).max(1).required(),
		telPostulante: Joi.string().min(7).max(100).required(),
		emailPostulante: Joi.string().max(100).required(),
	});
	return schema.validate(postulante);

}

// Export the router
module.exports = router;

/*
router.delete('/:id', [auth, editor], (req, res) => {
	const schema = Joi.number().integer().min(0).required();
	const validateId = schema.validate(req.params.id)
	if (validateId.error) {
		res.status(400).send(validateId.error.details[0].message)
		return;
	}
	const sql = `DELETE FROM postulante WHERE idPostulante = ${validateId.value}`
	connection.query(sql, (err, results) => {
		if (err) throw err;
		if (results.affectedRows == 0){
			res.status(404).send('El postulante ingresado no existe en la base de datos.');
			return;
		}
		res.status(200).send('El postulante ha sido agregado a la base de datos.');
	})
})

router.delete('/', [auth, editor], (req, res) => {
	const sql = `DELETE FROM postulante`
	connection.query(sql, (err, results) => {
		if (err) throw err;
		if (results.affectedRows == 0){
			res.status(404).send('No hay postulantes para borrar.');
			return;
		}
		res.status(200).send('Se han eliminado todos los postulantes.');
	})
})
*/