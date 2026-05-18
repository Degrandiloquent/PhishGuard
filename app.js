const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PORT } = require('./config/env');
const ingestionRoutes = require('./ingestion/ingestionRoutes');
const apiGateway = require('./gateway/apiGateway');
const dashboardRoutes = require('./dashboard/dashboardRoutes');
const loggerMiddleware = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use('/api/ingestion', ingestionRoutes);
app.use('/api/gateway', apiGateway);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PhishGuard' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
