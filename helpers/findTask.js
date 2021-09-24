// Devuelve el indice si lo encuentra, falso si no lo encuentra
module.exports = (database, id) => {
	return new Promise((resolve, reject) => {
		database.filter((value, index, array) => {
			console.log('----------')
			console.log(value.id, 'id index')
			console.log(value.id, 'id task')
			console.log(id, 'id mia')
			console.log('------------')
			if (value.id == id){
				resolve(index)
			}
		})
		resolve(false)
	})
}
