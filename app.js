//Dependencies
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require("helmet");
//DEFINE PORT
const PORT = process.env.PORT || 3001;
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

app.get('/', (req, res) => {
	res.send('Welcome to my API')
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

	connection.query(sql, postulanteObj, err => {
		console.log('success')
		if (err) throw err;
		res.send({
			message: 'Postulante agregado',
			success: true,
			payload: postulanteObj
		})
		
	})
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