const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
const verifyJWT = (req, res, next) => {
    console.log('JWT hitting');
    const authorization = req.headers.authorization;
    console.log(authorization);
    // check authorization present or not
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorize access' });
    }
    // find token
    const token = authorization.split(' ')[1];

    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ error: true, message: 'unauthorize access' });
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // service db
        // const database = client.db("sample_mflix");
        // const movies = database.collection("movies");

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('bookings');

        //jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h',
            })
            res.send({token});
        })

        //services
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
        // console.log('query --------')
        app.get('/bookings',verifyJWT,async (req, res) => {
            // console.log(req.query);

            // ***************JWT********************
            // console.log(req.headers.authorization);

            const decoded = req.decoded;

            // check email present or not
            if (decoded.email !== req.query.email) {
                return res.status(403).send({error:1,message:'forbidden access'})
            }
            console.log('decoded output: ', decoded);
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
            // console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        // delete single data
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // update single data
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updateBookings = req.body;
            console.log(updateBookings);

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updateBookings.status,
                }
            }
            const result = await bookingCollection.updateOne(filter, updateDoc);
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