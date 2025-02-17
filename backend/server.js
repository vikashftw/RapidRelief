const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/client');
const locationsRoutes = require('./routes/locations');
const disasterRoutes = require('./routes/disasters');
const clientRoutes = require('./routes/clients');
const authRoutes = require('./routes/auth')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    await Client.init(); 
    console.log('Client model initialized');
  })
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

app.use('/api/disasters', disasterRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/auth', authRoutes);
app.use((req, res, next) => {
  console.log(`Unhandled route: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on PORT ${PORT}`);
});

