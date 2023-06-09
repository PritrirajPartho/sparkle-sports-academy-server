const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware..........
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltzoo6n.mongodb.net/?retryWrites=true&w=majority`;

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
    /*Start work To here Bro.................... */
    const classesCollection = client.db("campDb").collection("classes");
    const bookedCollection = client.db("campDb").collection("booked");
    const usersCollection = client.db("campDb").collection("users");
    

    // users relatd apis.......

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email }
        const existingUser = await usersCollection.findOne(query);

        if (existingUser) {
          return res.send({ message: 'user already exists' })
        }
        else{
          const result = await usersCollection.insertOne(user);
          res.send(result);
        }
    });

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    //classes related
    app.get('/classes', async(req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

   //booked
    app.get('/bookeds', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }
      const query = { email: email };
      const result = await bookedCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/bookeds', async (req, res) => {
      const item = req.body;
      // console.log(item);
      const result = await bookedCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/booked/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookedCollection.deleteOne(query);
      res.send(result);
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


app.get('/', (req, res) => {
  res.send('Hello this is assignment 12')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})