//Dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// Import routes
const authRouter = require("./routes/auth");
const postulantesRouter = require("./routes/postulantes");
const sendEmailRouter = require("./routes/send-email");
//DEFINE PORT
const PORT = process.env.PORT || 3001;

//INSTANTIATE SERVER
const app = express();
//MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(helmet());
// Setup all the routes
app.use("/api/postulantes", postulantesRouter);
app.use("/api/auth", authRouter);
app.use("/api/send-email", sendEmailRouter)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})