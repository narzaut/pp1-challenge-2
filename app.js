//Dependencies
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const helmet = require("helmet");
//DEFINE PORT
const PORT = process.env.PORT || 3001;
//DEFINE EMAIL API
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
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
app.use(bodyParser.json());
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
	transporter.sendMail({
		from: '"Nuevo postulante" <notificacionsindicarne@gmail.com>',
		to: 'i.arzaut@itecriocuarto.org.ar',
		subject: 'Sindicarne Río Cuarto',
		html: `
			<!DOCTYPE HTML>
			<html style="margin: 0; padding: 0; ">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				
				</head>
				<body style="margin: 0; padding: 0; ">
					<div style=" ">
						<div style="">
							<h2 ">Datos del postulante</h2>
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
			res.status(200).jsonp(req.body);
		}
		})
})

app.get('/postulantes', (req, res) => {
	const sql = 'SELECT * from postulante';

	connection.query(sql, (err, results) => {
		if (err) throw err;
		if (results.length > 0){
			res.json(results);
		}else {
			res.send('No results')
		}
	})
})

app.get('/postulantes/:id', (req, res) => {
	const { id } = req.params;
	const sql = `SELECT * FROM postulante WHERE idPostulante = ${id}`;
	connection.query(sql, (err, results) => {
		if (err) throw err;
		if (results.length > 0){
			res.json(results);
		}else {
			res.send('No results')
		}
	})
})

app.post('/add', (req, res) => {
	const sql = 'INSERT INTO postulante SET ?';
	const postulanteObj = {
		nombrePostulante: req.body.nombrePostulante,
		dniPostulante: req.body.dniPostulante,
		fingresoPostulante: req.body.fingresoPostulante,
		fnacimientoPostulante: req.body.fnacimientoPostulante,
		estadocivil: req.body.estadocivil,
		empresaPostulante: req.body.empresaPostulante,
		activoPostulante: req.body.activoPostulante,
		telPostulante: req.body.telPostulante,
		emailPostulante: req.body.emailPostulante,
		fcargaPostulante: req.body.fcargaPostulante
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
			const datos = await isDuplicate();
			if (datos == false){
				connection.query(sql, postulanteObj, err => {
					if (err) throw err;
					res.send({
						message: 'Postulante agregado',
						success: true,
						payload: postulanteObj
					})	
					console.log('added to db')
		
				})
			} else{
				console.log('el usuario ya existe')
			}
		} catch {
			console.log('ERRROR	')
		}
		
	}
	addToDb()
		
	

})

app.delete('/delete/:id', (req, res) => {
	const { id } = req.params;
	const sql = `DELETE FROM postulante WHERE idPostulante = ${id}`
	connection.query(sql, (err) => {
		
		if (err) throw err;
		res.send({
			message: 'Postulante eliminado',
			success: true
		})
	})
})

app.delete('/delete', (req, res) => {
	const sql = `DELETE FROM postulante`
	connection.query(sql, (err) => {
		if (err) throw err;
		res.send({
			message: 'Todos los postulantes han sido eliminados',
			success: true
		})
	})
})