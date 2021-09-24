module.exports = (campo) => {
	const Joi = require('joi')
	.extend(require('@joi/date'));
	return new Promise((resolve,reject) => {
		if (campo == 'title'){
			resolve(Joi.string().min(3).max(24).required())
		} else if (campo == 'creationDate'){
			resolve(Joi.date().format('DD-MM-YYYY').required())
		} else if (campo == 'completedDate'){
			resolve(Joi.date().format('DD-MM-YYYY'))
		} else if (campo == 'assignedTo'){
			resolve(Joi.string().min(2).max(24).required())
		} else if (campo == 'status'){
			resolve(Joi.string().valid(...['NEW', 'ACTIVE', 'IN_PROGRESS', 'DONE', 'BLOCKED']).required())
		}
	})
}