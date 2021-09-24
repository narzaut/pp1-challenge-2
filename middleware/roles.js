function viewer(req, res, next) {
    if (!req.user.roles.includes("viewer")) return res.status(403).send({
        ok: false,
        error: "Access denied."
    });

    next();
}

function editor(req, res, next) {
	if (!req.user.roles.includes("editor")) return res.status(403).send({
			ok: false,
			error: "Access denied."
	});

	next();
}

function poster(req, res, next) {
	if (!req.user.roles.includes("poster")) return res.status(403).send({
			ok: false,
			error: "Access denied."
	});

	next();
}



module.exports = { viewer, editor, poster };