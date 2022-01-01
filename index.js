import  express from "express";
import Razorpay from "razorpay";
import shortid from "shortid";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";


dotenv.config();
const app = express()

app.use(cors());
app.use(express.json()) 

const razorpay = new Razorpay({
    key_id: 'rzp_test_6jxVwaoOnk2gWt',
    key_secret: 'Z5eLxuo0oFy9BW5wKpZgnMIN',
  });

const PORT = process.env.PORT;  
const MONGO_URL = process.env.MONGO_URL; 

async function createConnection(){                         
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongodb connected");
    return client;
}

const client = await createConnection();



app.get('/furniture',async (req,res) => {

 const furniture = await client.db("b28wd").collection("furniture").find().toArray();
 res.send(furniture);

    
})

app.post('/furniture', async (req,res) =>{

    const data = req.body;
    const add = await client.db("b28wd").collection("furniture").insertOne(data);
    res.send({ message : "Added new Furniture to List !!" });

} )

app.get('/appliances',async (req,res) => {

    const appliances = await client.db("b28wd").collection("appliances").find().toArray();
    res.send(appliances);
   
});

app.post('/appliances', async (req,res) =>{

    const data = req.body;
    const add = await client.db("b28wd").collection("appliances").insertOne(data);
    res.send({ message : "Added new appliance to List !!" });

} )

app.get('/funzone',async (req,res) => {

    const funzone = await client.db("b28wd").collection("funzone").find().toArray();
    res.send(funzone);
   
});

app.post('/funzone', async (req,res) =>{

    const data = req.body;
    const add = await client.db("b28wd").collection("funzone").insertOne(data);
    res.send({ message : "Added new appliance to List !!" });

} )

app.get('/laptops',async (req,res) => {

    const laptops = await client.db("b28wd").collection("laptops").find().toArray();
    res.send(laptops);
   
});

app.post('/laptops', async (req,res) =>{

    const data = req.body;
    const add = await client.db("b28wd").collection("laptops").insertOne(data);
    res.send({ message : "Added new Laptop to List !!" });

} )

app.post('/payment/placeorder',async (req,res)=> {
    
    const { amount,customer,items,dateRange } = req.body;
    const payment_capture = 1
	const currency = 'INR'

    const options = {
		amount: amount * 100,
		currency: currency,
		receipt: shortid.generate(),
		payment_capture: payment_capture
	}

    try {
		const response = await razorpay.orders.create(options)

		res.send({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		});
	} catch (error) {
		console.log(error)
	}

})

app.post('/payment/verification', async (req,res) => {

    const { razorpay_payment_id,items,customer,dateRange,amount,razorpay_order_id  } = req.body;

    const data =
    {   
        customer,
        items,
        dateRange,
        amount,
        order_Id: razorpay_order_id,  
    }

    razorpay.payments.fetch(razorpay_payment_id).then((paymentdoc) => {

        if(paymentdoc.status == 'captured'){
            client.db("b28wd").collection("orders").insertOne(data);
            res.send({ message : 'Payment was successfull!!', order_Id: razorpay_order_id });
        }
        else{
            res.send({message: 'Payment unsuccessfull...'});
        }

    });
})

app.post('/login',(req,res) => {
    const {username,password}=req.body;
    if(username==process.env.username && password==process.env.password){
      
        res.send({ message: "Logged In" });
    }else{
        res.send({message: "Invalid Credentials!!"});
    }


})

app.get("/orders",async (req,res) => {

    const orders = await client.db("b28wd").collection("orders").find().toArray();
    res.send(orders);

})


app.get('/',(req,res)=> {
    res.send("hello");
})

app.listen(PORT, () => console.log("App is started in Port",PORT));

