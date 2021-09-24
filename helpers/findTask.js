// Devuelve el indice si lo encuentra, falso si no lo encuentra
module.exports = (database, id) => {
	return new Promise((resolve, reject) => {
		database.filter((value, index, array) => {
			if (value.id == id){
				resolve(index)
			}
		})
		resolve(false)
	})
}
