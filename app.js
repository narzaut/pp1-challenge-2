//Dependencies
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const Joi = require('joi');
//DEFINE PORT
const PORT = process.env.PORT || 3001;
//DEFINE EMAIL API
const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,	
	auth: {
		user:'notificacionsindicarne@gmail.com',
		pass:'mozqdjeijvgaqevv'
	}
})
transporter.verify().then(() => {
	console.log('Ready to send email')
})
//INSTANTIATE SERVER
const app = express();
//MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(helmet());
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

app.listen(PORT, () => {
	console.log('Server running on port 3001')
})

//SEND NOTIFICATION MAIL 
app.post('/send-email', (req, res) => {
	const { error } = validateEmail(req.body);
	if (error){
		res.status(400).send(error.details[0].message);
		return;
	}
	transporter.sendMail({
		from: "'Nuevo postulante' <notificacionsindicarne@gmail.com>",
		to: 'i.arzaut@itecriocuarto.org.ar',
		subject: 'Sindicarne Río Cuarto',
		html: `
			<!DOCTYPE HTML>
			<html style='margin: 0; padding: 0; '>
				<head>
					<meta charset='utf-8' />
					<meta name='viewport' content='width=device-width, initial-scale=1' />
				
				</head>
				<body style='margin: 0; padding: 0; '>
					<div style=' '>
						<div style=''>
							<h2 '>Datos del postulante</h2>
							<div>
								<h3>Nombre: ${req.body.nombrePostulante}</h3>
								<h3>DNI: ${req.body.dniPostulante}</h3>
								<h3>Teléfono: ${req.body.telPostulante}</h3>
								<h3>E-mail: ${req.body.emailPostulante}</h3>
								<h3>Empresa: ${req.body.empresaPostulante}</h3>
							</div>
						</div>
					</div>
				</body>
			</html>
		`
	}, (error, info) => {
		if (error) {
			res.status(500).send(error.message);

		}else {
			console.log('Email enviado exitosamente')
			res.status(200).send(req.body);
		}
		})
})

app.get('/api/postulantes', (req, res) => {
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

app.get('/api/postulantes/:id', (req, res) => {
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

app.post('/api/postulantes', (req, res) => {
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
						success: true,
						payload: postulante.value
					})	
					console.log('added to db')
				})
			} else{
				res.status(400).send({
					message: 'El postulante ya existe en la base de datos',
					success: false,
					payload: postulante.value
				})
			}
		} catch {
			console.log('ERRROR	')
		}
		
	}
	addToDb()
})

app.delete('/api/postulantes/:id', (req, res) => {
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

const validateEmail = (email) => {
	const schema = Joi.object({
		nombrePostulante: Joi.string().min(3).max(250).required(),
		dniPostulante: Joi.string().min(7).max(11).required(),
		telPostulante: Joi.string().min(7).max(100).required(),
		emailPostulante: Joi.string().max(100).required(),
		empresaPostulante: Joi.string().max(250).required()
	});

	return schema.validate(email);
}

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

/* DELETE
app.delete('/postulantes', (req, res) => {
	const sql = `DELETE FROM postulante`
	connection.query(sql, (err) => {
		if (err) throw err;
		res.send({
			message: 'Todos los postulantes han sido eliminados',
			success: true
		})
	})
})
*/


/*
Deberia mantener el endpoint de send-email junto con su servicio en el mismo archivo?
*/