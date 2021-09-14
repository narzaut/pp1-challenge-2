const express = require('express');
const nodemailer = require('nodemailer');

// Setup the express server router
const router = express.Router();

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

//SEND NOTIFICATION MAIL 
router.post('/', (req, res) => {
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

// Export the router
module.exports = router;