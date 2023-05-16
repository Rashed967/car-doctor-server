const express = require('express')
const cors = require('cors');
const jwt - require('jsonwebtoken')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

console.log(process.env.DB_USER)

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const req = require('express/lib/request');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kt6fwyn.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const servicesCollection = client.db('carDoctor').collection('services')
    const checkingCollection = client.db('carBooks').collection('carBook')

    // jwt 
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn : '1h'
      })
      res.send(token)
    })

    // services 
    app.get('/services', async (req, res) => {
        const query = req.query;
        const result = await servicesCollection.find().toArray()
        res.send(result)
    })

    
    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { title: 1, price: 1, service_id : 1, img : 1},
          };
      
        const result = await servicesCollection.findOne(query, options)
        res.send(result)
    })

    app.get('/checkout', async(req, res) => {
      let query = {};
      const result = await checkingCollection.find(query).toArray()
      res.send(result)
      console.log(query)
    })

    app.post('/checkout', async (req, res ) => {
        const checkout = req.body;
        const result = await checkingCollection.insertOne(checkout)
        res.send(result)
    })

    app.patch('/checkout/:id', async (req, res) => {
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const updatedBook = req.body;
      const newUpdatedBook = {
        $set : {
          status : updatedBook.status
        }
      }
      const result = await checkingCollection.updateOne(filter, newUpdatedBook)
      res.send(result)
      console.log(result)
    })

    app.delete('/checkout/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await checkingCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,  res) => {
    res.send('express is running')
})

app.listen(port, ()  => {
    console.log('server is runnign in port' , port)
})
