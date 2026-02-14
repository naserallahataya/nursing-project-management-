const express = require('express');
const app = express();
const port = 3000;
const dotenv = require("dotenv")
const connectDB = require('./database/connect');
const cors = require('cors');
dotenv.config()
const userRoutes = require('./routes/user.route');
const buildRoutes = require('./routes/build.route');
const hospitalRoutes = require('./routes/hospital.route');
const adminRoutes = require("./routes/admin.route")
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);


app.use('/api/v1/users', userRoutes);
app.use('/api/v1', buildRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);


app.use("/api/supervisor", require("./routes/supervisor.routes"));
app.use("/api/shift", require("./routes/shift.routes"));
app.use("/api/vacation", require("./routes/vacation.routes"));



connectDB();
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});