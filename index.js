const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j6xnqa4.mongodb.net/?retryWrites=true&w=majority`;

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

        const taskCollection = client.db('taskDB').collection('tasks')
        const userCollection = client.db('taskDB').collection('users')
        const reviewCollection = client.db('taskDB').collection('reviews')



        //task api

        app.post('/tasks', async (req, res) => {
            const task = req.body;
            console.log(task);

            const result = await taskCollection.insertOne(task);
            res.send(result)
        })
        app.get('/tasks', async (req, res) => {
            const result = await taskCollection.find().toArray()
            res.send(result)
        })
        app.get('/tasks/:email', async (req, res) => {
            const email = req.params.email

            const result = await taskCollection.find({ email: email }).toArray()
            res.send(result)
        })

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });


        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatetasks = req.body;
            const tasks = {
                $set: {
                    title: updatetasks.title,
                    note: updatetasks.note,
                    status: updatetasks.status,

                }
            }
            const result = await taskCollection.updateOne(filter, tasks, options);

            res.send(result)
        })

        //user api

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            //insert email if user doesnot exists

            const query = { email: user.email }
            const existuser = await userCollection.findOne(query);
            if (existuser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }

            const result = await userCollection.insertOne(user);
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })


        //  Review 
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray()
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




app.get('/', (req, res) => {
    res.send('task manager server is running')


})


app.listen(port, () => {
    console.log(`task manager server is running on port : ${port} `);
})