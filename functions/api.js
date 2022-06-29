// Express to run server and routes
const express = require("express");
// Dependencies
const bodyParser = require("body-parser");
//
const cors = require("cors");
//
const serverless = require("serverless-http");




// Start up an instance of app
const app = express();
//
const router = express.Router();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure express to use body-parser as middle-ware.
// Cors for cross origin allowance
app.use(cors());




var Airtable = require('airtable');
var base = new Airtable({
     endpointUrl: 'https://api.airtable.com',
     apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME);


// Extract only the color data from response
const justColorData = record => {
     return {
          ...record.fields,
          id: record.id
     }
}

router.get('/colors', async (req, res) => {
     try {
          const records = await table.select({
               view: "Netlify view" // sort managed in view
          }).all();
          const colors = records.map(record => {
               return justColorData(record);
          });
          console.log(colors);
          res.status(200).json( colors );
     } catch(err) {
          console.error(err);
     }
});

router.post('/colors', async (req, res) => {
     try {
          const createdRecord = await table.create({
               min_temp: parseFloat(req.body.min_temp),
               max_temp: parseFloat(req.body.max_temp),
               color: req.body.color
          });
          const colorJSON = justColorData(createdRecord);
          console.log(colorJSON);
          res.status(200).json( colorJSON );
     } catch(err) {
          console.error(err);
     }
});

router.patch('/colors/:id', async (req, res) => {
     try {
          const updatedRecord = await table.update(req.params.id, {
               min_temp: parseFloat(req.body.min_temp),
               max_temp: parseFloat(req.body.max_temp),
               color: req.body.color
          });
          const colorJSON = justColorData(updatedRecord);
          console.log(colorJSON);
          res.status(200).json( colorJSON );
     } catch(err) {
          console.error(err);
     }
});

router.delete('/colors/:id', async (req, res) => {
     try {
          const deletedRecord = await table.destroy(req.params.id);
          const colorJSON = justColorData(deletedRecord);
          console.log(colorJSON);
          res.status(200).json( colorJSON );
     } catch(err) {
          console.error(err);
     }
});

/*
router.get('/colors/:id', async (req, res) => {
     try {
          const record = await table.find(req.params.id);
          const colorJSON = justColorData(record);
          console.log(colorJSON);
          res.status(200).json( record );
     } catch(err) {
          console.error(err);
     }
});
*/

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);