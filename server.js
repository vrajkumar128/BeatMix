const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const presetHandler = require('./presetHandler');

// CORS request middleware
app.use(cors());

// Logging Middleware
app.use(morgan('dev'));

// Body-parsing middleware
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Also explicitly map /public to the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

const presets = require('./presets');

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/presets', (req, res) => {
  res.send(presets);
});

// Handle presets requests
app.use('/presets/:id', (req, res) => {
  let index = Number(req.params.id);
  let presetArray = req.body;
  let isValidPreset = presetArray && presetArray.length === 4
    && presetArray.every((singleRow) => {
      return singleRow.length === 16
        && singleRow.every((singleGridElement) => {
          return singleGridElement === true || singleGridElement === false;
        });
    });
  if (req.method === 'PUT' && !isValidPreset) {
    res.status(400).send('Bad Request, send a preset array!');
  } else {
    let method = req.method;
    let [status, preset] = presetHandler(method, index, presetArray);
    res.status(status).send(preset);
  }
});

// Use the PORT environment variable
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});