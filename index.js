const express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const port = process.env.PORT

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs')
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
const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)
const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization;
    const token = authHeader?.split(' ')[1]
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    try {
        const { payload } = await jwtVerify(token, JWKS)
        console.log(payload)
        next()
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden' })
    }

}
async function run() {
    try {
        // await client.connect();
        const db = client.db('World-Heritage-Site')
        const heritageCollection = db.collection('heritages')
        const bookingCollection = db.collection('booking')

        app.get('/feature',async(req,res)=>{
            const result=await heritageCollection.find().limit(3).toArray()
            res.json(result)
        })
        app.get('/heritages', async (req, res) => {
            const result = await heritageCollection.find().toArray()
            res.json(result)
        })

        app.get('/heritages/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const result = await heritageCollection.findOne({ _id: new ObjectId(id) })
            // console.log(result)
            res.json(result)
        })

        app.post('/heritages', verifyToken, async (req, res) => {
            const heritageData = req.body;
            const result = await heritageCollection.insertOne(heritageData)
            console.log(result, 'result')
            res.json(result)
        })

        app.patch('/heritages/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const update = req.body;
            const result = await heritageCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: update }
            )
            res.json(result)
            // console.log(result,'update result')
        })

        app.delete('/heritages/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const result = await heritageCollection.deleteOne({ _id: new ObjectId(id) })
            res.json(result)
            // console.log(result,'delete result')
        })

        app.get('/booking/:userId',verifyToken,async(req,res)=>{
            const {userId}=req.params;
            const result=await bookingCollection.find({userId:userId}).toArray()
            res.json(result)
            // console.log('booking result',result)
        })

        app.post('/booking',verifyToken,async(req,res)=>{
            const bookingdata=req.body;
            const result=await bookingCollection.insertOne(bookingdata)
            res.json(result)
            // console.log(result,'booking data')
        })

        app.delete('/booking/:id',verifyToken,async(req,res)=>{
            const {id}=req.params;
            const result=await bookingCollection.deleteOne({_id:new ObjectId(id)})
            res.json(result)
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