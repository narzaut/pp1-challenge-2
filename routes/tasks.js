// Import dependencies
const express = require("express");
const Joi = require('joi')
	.extend(require('@joi/date'));
// Setup the router for express
const router = express.Router();
// Helpers
const findTask = require('../helpers/findTask.js')
const createBodySchema = require('../helpers/createBodySchema.js')
// DB
var database = []
var idCounter = 0;
// Create task schema - validate task
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
// Get all tasks
router.get('/', (req, res) => {
	if (database.length < 1) res.status(404).send('No existen tasks en la base de datos')
	res.status(200).send(database)
})
// Get task by id
router.get('/:id', async (req, res) => {
	const schema = Joi.number().integer().min(0).required();
	const validateId = schema.validate(req.params.id)
	const found = await findTask(database, validateId.value)
	// Validate params
	if (validateId.error) {
		res.status(400).send(validateId.error.details[0].message)
		return;
	}
	// Check if task exists in database
	if (!database[found]) {
		res.status(404).send(`El task con ID ${validateId.value} no existe.`)
		return;
	}
	// Send task
	res.status(200).send(database[found])	
})
// Post task to db
router.post('/', (req, res) => {
	// Validate request body
	const task = validateTask(req.body)
	if (task.error){
		res.status(400).send(task.error.details[0].message);
		return;
	}
	// Push to database
	if (req.body.completedDate){
		database.push({id: idCounter, ...task.value})
	} else{
		database.push({id: idCounter, ...task.value, completedDate: ''})
	}
	idCounter ++;

	res.status(200).send(`Task ID ${idCounter-1} fue agregado a la base de datos.`)	
})
// Delete task by id
router.delete('/:id', async (req, res) => {
	const schema = Joi.number().integer().min(0).required();
	const validateId = schema.validate(req.params.id)
	const found = await findTask(database, validateId.value)
	// Validate params
	if (validateId.error) {
		res.status(400).send(validateId.error.details[0].message)
		return;
	}
	// Check if task exists in database
	if (!database[found]) {
		res.status(404).send(`El task con ID ${validateId.value} no existe.`)		
		return;
	}
	// Delete task
	database.splice(found, 1)
	res.status(200).send(`El task con ID ${validateId.value} se ha eliminado.`)

})
// Edit task by id and field name
router.put('/:id/:campo', async (req, res) => {
	const idSchema = Joi.number().integer().min(0).required();
	const campoSchema = Joi.string().required().valid(...['title', 'creationDate', 'assignedTo', 'status', 'completedDate'])
	const validateId = idSchema.validate(req.params.id)
	const validateCampo = campoSchema.validate(req.params.campo)
	const found = await findTask(database, validateId.value)
	
	// Validate params
	if (validateId.error || validateCampo.error) {
		if (validateId.error) res.status(400).send(validateId.error.details[0].message)
		if (validateCampo.error) res.status(400).send(validateCampo.error.details[0].message)
		return;
	}
	// Validate body key
	if (!(validateCampo.value in req.body) || Object.keys(req.body).length != 1){
		if (!(validateCampo.value in req.body)) res.status(400).send(`El campo ${validateCampo.value} es necesario`)
		if (Object.keys(req.body).length != 1) res.status(400).send(`Solo ingresar el campo ${validateCampo.value}`)
		return;
	} 
	// Validate body value
	const bodySchema = await createBodySchema(validateCampo.value)
	const validateBody = bodySchema.validate(Object.values(req.body)[0])
	if (validateBody.error) {
		res.status(400).send(validateBody.error.details[0].message)
		return;
	}
	// Check for task in database
	if (!database[found]){
		res.status(404).send(`El task con ID ${validateId.value} no existe.`)		
		return;
	}
	
	// Update the task
	database[found] = {...database[found], [validateCampo.value]:validateBody.value}
	res.status(200).send(`El campo ${validateCampo.value} del task ID ${validateId.value} fue modificado a ${validateBody.value}`)
})

// Export the router
module.exports = router;