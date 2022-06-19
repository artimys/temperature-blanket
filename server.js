// Weather data imported from file
const TemperatureData = require('./kingston_1981.json');

// Express to run server and routes
const express = require("express");

// Start up an instance of app
const app = express();

/* Dependencies */
const bodyParser = require("body-parser");
/* Middleware*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Here we are configuring express to use body-parser as middle-ware.
// Cors for cross origin allowance
const cors = require("cors");
app.use(cors());

// Initialize the main project folder
app.use(express.static("website"));


// Callback to debug
const listening = () => {
     console.log("server running, Yay!!");
     console.log("running on localhost:", port);
};

// Spin up the server
const port = 8000;
const server = app.listen(port, listening);



// Initialize all route with a callback function
const getTemps = (request, response) => {
     console.log("GET '/temps'");
     // console.log(" -> response:", TemperatureData);
     response.send(TemperatureData);
};

// Callback function to complete GET '/temps'
app.get('/temps', getTemps);


