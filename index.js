const express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const port = process.env.PORT

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const db=client.db('World-Heritage-Site')
        const heritageCollection=db.collection('heritages')
        
        app.get('/heritages',async(req,res)=>{
            const result=await heritageCollection.find().toArray()
            res.json(result)
        })

        app.get('/heritages/:id',async(req,res)=>{
            const {id}=req.params;
            const result=await heritageCollection.findOne({_id:new ObjectId(id)})
            // console.log(result)
            res.json(result)
        })
        
        app.post('/heritages',async(req,res)=>{
            const heritageData=req.body;
            const result=await heritageCollection.insertOne(heritageData)
            console.log(result,'result')
            res.json(result)
        })

        app.patch('/heritages/:id',async(req,res)=>{
            const {id}=req.params;
            const update=req.body;
            const result=await heritageCollection.updateOne(
                {_id:new ObjectId(id)},
                {$set:update}
            )
            res.json(result)
            // console.log(result,'update result')
        })

        app.delete('/heritages/:id',async(req,res)=>{
            const {id}=req.params;
            const result=await heritageCollection.deleteOne({_id:new ObjectId(id)})
            res.json(result)
            // console.log(result,'delete result')
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.json('Server is successfuly Running')
})
app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`)
})