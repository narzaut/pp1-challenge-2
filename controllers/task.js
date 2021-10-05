
// Model
const task = require('../model/task.js')

export const get = () => {
    if (task.database.length < 1) res.status(404).send('No existen tasks en la base de datos')
    return task.database
}


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

export default get;