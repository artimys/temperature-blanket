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




router.get('/colors', async (req, res) => {
     try {
          const records = await table.select({
               view: "Netlify view" // sort managed in view
          }).all();
          const colors = records.map(record => {
               return {
                    ...record.fields,
                    id: record.id
               }
          })
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
          console.log(createdRecord);
          res.status(200).json( createdRecord );
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
          console.log(updatedRecord);
          res.status(200).json( updatedRecord );
     } catch(err) {
          console.error(err);
     }
});

router.delete('/colors/:id', async (req, res) => {
     try {
          const deletedRecord = await table.destroy(req.params.id);
          console.log(deletedRecord);
          res.status(200).json( deletedRecord );
     } catch(err) {
          console.error(err);
     }
});

// router.get('/colors/:id', async (req, res) => {
//      const record = await table.find(req.params.id);
//      res.status(200).json( record );
// });


app.use("/.netlify/functions/api", router);
// app.use("/api", router);

module.exports.handler = serverless(app);