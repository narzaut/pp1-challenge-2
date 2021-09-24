// Import dependencies
const express = require("express");
const Joi = require('joi')
	.extend(require('@joi/date'));
// Import middlewares
const auth = require("../middleware/auth");
const { editor, viewer, poster } = require("../middleware/roles");

// Setup the router for express
const router = express.Router();
// Helper
const findTask = require('../helpers/findTask.js')
// DB
var database = []
var idCounter = 0;
// Create schema - Validate task
const validateTask = (task) => {
	const schema = Joi.object({
		title: Joi.string().min(3).max(24).required(),
		creationDate: Joi.date().format('DD-MM-YYYY').required(),
		completedDate: Joi.date().format('DD-MM-YYYY'),
		assignedTo: Joi.string().min(2).max(24).required(),
		status: Joi.string().valid(...['NEW', 'ACTIVE', 'IN_PROGRESS', 'DONE', 'BLOCKED']).required()
	});
	return schema.validate(task);

}

// Requests
router.get('/', [auth, viewer], (req, res) => {
	if (database.length > 0){
		res.json(database)
	} else {
		res.status(404).send({
			status: 404,
			message: 'No hay tasks en la base de datos'
		})
	}	
})

router.get('/:id', [auth, viewer], async (req, res) => {
	const schema = Joi.number().integer().min(0).required();
	const validateId = schema.validate(req.params.id)
	const found = await findTask(database, validateId.value)
	if (validateId.error) {
		res.status(400).send(validateId.error.details[0].message)
		return;
	}
	if (!database[found]) {
		res.status(404).send(`El task con ID ${validateId.value} no existe.`)
		return;
	}
	res.status(200).send(database[found])

	
})

router.post('/', [auth, poster], (req, res) => {
	const task = validateTask(req.body)
	if (task.error){
		res.status(400).send(task.error.details[0].message);
		return;
	}
	if (req.body.completedDate){
		database.push({id: idCounter, ...task.value})
	} else{
		database.push({id: idCounter, ...task.value, completedDate: ''})
	}
	idCounter ++;
	res.status(200).send({
		message: 'task agregado',
		status:200,
		success: true,
		payload: task.value
	})	
	console.log('added to db')
})

router.delete('/:id', [auth, editor], async (req, res) => {
	const schema = Joi.number().integer().min(0).required();
	const validateId = schema.validate(req.params.id)
	const found = await findTask(database, validateId.value)
	if (validateId.error) {
		res.status(400).send(validateId.error.details[0].message)
		return;
	}
	if (!database[found]) {
		res.status(404).send(`El task con ID ${validateId.value} no existe.`)		
		return;
	}
	database.splice(found, 1)
	res.status(200).send(`El task con ID ${validateId.value} se ha eliminado.`)

})

router.put('/:id/:campo', [auth, editor], async (req, res) => {
	const idSchema = Joi.number().integer().min(0).required();
	const campoSchema = Joi.string().required().valid(...['title', 'creationDate', 'assignedTo', 'status', 'completedDate'])
	const validateId = idSchema.validate(req.params.id)
	const validateCampo = campoSchema.validate(req.params.campo)
	const found = await findTask(database, validateId.value)
	
	// VALIDATE PARAMS
	if (validateId.error || validateCampo.error) {
		if (validateId.error) res.status(400).send(validateId.error.details[0].message)
		if (validateCampo.error) res.status(400).send(validateCampo.error.details[0].message)
		return;
	}
	//VALIDATE BODY
	if (!(validateCampo.value in req.body) || Object.keys(req.body).length != 1){
		if (!(validateCampo.value in req.body)) res.status(400).send(`El campo ${validateCampo.value} es necesario`)
		if (Object.keys(req.body).length != 1) res.status(400).send(`Solo ingresar el campo ${validateCampo.value}`)
		return;
	} 

	if (!database[found]){
		res.status(404).send(`El task con ID ${validateId.value} no existe.`)		
		return;
	}


	
})

// Export the router
module.exports = router;