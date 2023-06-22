const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq7g3og.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toyCollection = client.db('toyHut').collection('toyCars');


    app.get('/toyCars', async (req, res) => {
      const limit = req.query.limit || 20;
      const cursor = toyCollection.find().limit(Number(limit));
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/toyCars/:id', async (req, res) => {
      const { id } = req.params;
      const toy = await toyCollection.findOne({ _id: new ObjectId(id) });
      res.json(toy);
    });

    app.get('/myToys', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
    
      const sortOptions = {
        desc: { price: -1 }, // Sort by price in descending order
        asc: { price: 1 }, // Sort by price in ascending order
      };
    
      const result = await toyCollection
        .find(query)
        .sort(sortOptions[req.query.sortBy || 'desc'])
        .toArray();
    
      res.send(result);
    });


    app.post('/toyCars', async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    })


    app.put('/toyCars/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToy = req.body;

      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description
        }
      }

      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    })


    app.delete('/toyCars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Toy hut is running')
})

app.listen(port, () => {
  console.log(`Toy Hut Server is running on port ${port}`)
})