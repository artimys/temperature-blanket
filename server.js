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


const db = require("./db/colors");


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




app.get('/temps', (req, res) => {
     console.log("GET '/temps'");
     // console.log(" -> response:", TemperatureData);
     res.send(TemperatureData);
});



app.post('/colors', async (req, res) => {
     const results = await db.createColor(req.body);
     res.status(201).json({ id: results[0] });
});

app.get('/colors', async (req, res) => {
     const colors = await db.getAllColors();
     res.status(200).json({ colors });
});

app.patch('/colors/:id', async (req, res) => {
     const id = await db.updateColor(req.params.id, req.body);
     res.status(200).json({ id });
});

app.delete('/colors/:id', async (req, res) => {
     await db.deleteColor(req.params.id);
     res.status(200).json({ success: true });
});