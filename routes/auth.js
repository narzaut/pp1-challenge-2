// Import dependencies
const jwt = require("jsonwebtoken");
const express = require("express");

// Setup the express server router
const router = express.Router();

// On post
router.post("/", (req, res) => {
    // Dummy users
    const users = [{ user: "narz", roles: ["viewer", "editor", "poster"] }, {user:"postulante", roles: ["poster"]}];

    // Get to user from the database, if the user is not there return error
    let user = users.find(u => u.user === req.body.user);
    if (!user) {
			res.status(404).send({
				message: 'Acceso denegado',
				ok:false
			})
		}

    const token = jwt.sign({
        id: user._id,
        roles: user.roles,
    }, "jwtPrivateKey", { expiresIn: "15m" });

    res.send({
        ok: true,
        token: token
    });
});

// Export the router
module.exports = router;