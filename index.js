const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const bookingCollection = client.db('carDoctor').collection('bookings');

        // find or get or all data loaded
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // find or get or single data loaded using id
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            // get all data using query id
            const query = { _id: new ObjectId(id) };

            // get some or all data using option
            const options = {
                //set condition which data we are get
                // value:0 means ---not get dada
                // value:1 means ---get data data
                // id by default get
                projection: {
                    title: 1,
                    price: 1,
                    service_id: 1,
                    img:1,
                 },
            };
            const result = await serviceCollection.findOne(query,options);
            res.send(result);
        })

        // find or get some booking data using query
        console.log('query --------')
        app.get('/bookings', async (req, res) => {
            console.log(req.query);
            let query = {};
            if (req.query ?. email) {
                query={email:req.query.email}
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);

        })
        // booing single data or post

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
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
    res.send('Cars doctor is running');
}) 
app.listen(port, () => {
    console.log(`Car doctor is running on port: ${port}`)
})