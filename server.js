// Dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https')
const fs = require('fs')
// Import routes
const authRouter = require("./routes/auth");
const postulantesRouter = require("./routes/postulantes");
const sendEmailRouter = require("./routes/send-email");
// Define port
const PORT = process.env.PORT || 3030;
// Instantiate server
const app = express();

// Middlewares
/*var distDir = __dirname + "/dist/";
app.use(express.static(distDir));*/
app.use(express.json());
app.use(cors());
app.use(helmet());
// Setup all the routes
app.use("/api/auth", authRouter);
app.use("/api/postulantes", postulantesRouter);
app.use("/api/send-email", sendEmailRouter)

app.get("/", (req,res) => {
	res.send('hola')
})

https.createServer({
  key: fs.readFileSync('cert/server.key'),
  cert: fs.readFileSync('cert/server.cert')
}, app).listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
/*app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})*/
