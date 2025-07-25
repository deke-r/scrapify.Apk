const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/routes');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/scrapify/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/scrapify', routes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
