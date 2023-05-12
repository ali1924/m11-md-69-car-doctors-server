const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

// userName and Password
const userName = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
console.log('userName: ', userName);
console.log('password: ', password);

//mongodb connection

// const uri = `mongodb+srv://<username>:<password>@cluster0.bg5p3bd.mongodb.net/?retryWrites=true&w=majority`;
const uri =`mongodb+srv://${userName}:${password}@cluster0.bg5p3bd.mongodb.net/?retryWrites=true&w=majority`

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

        // service db
        // const database = client.db("sample_mflix");
        // const movies = database.collection("movies");

        const serviceCollection = client.db('carDoctor').collection('services');

        // find or get
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
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


// just server checking localhost
app.get('/', (req, res) => {
    res.send('Cars doctor is running')
}) 
app.listen(port, () => {
    console.log(`Car doctor is running on port: ${port}`)
})