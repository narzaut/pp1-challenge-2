// Dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// Import routes
const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");
// Define port
const PORT = process.env.PORT || 3030;
// Instantiate server
const app = express();
// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
// Setup all the routes
app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);

app.get("/", (req,res) => {
	res.send('Sindicarne API')
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
