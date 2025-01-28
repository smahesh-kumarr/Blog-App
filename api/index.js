const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); 

const app = express();

app.use(express.json());
app.use(cors());

const url = 'mongodb://localhost:27017/BlogApp';

const Userschema = new mongoose.Schema({
 username: {type: String, required: true, unique: true},
 password: {type: String, required:true},
});

const User = mongoose.model('User', Userschema);


app.post('/register', async(req,res)=>{
    const {username,password}=req.body;
    try{
        const exitingUser = await User.findOne({username});
        if(exitingUser){
            return res.status(400).json({message: 'Username already exists'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword});
        await newUser.save();
        
        res.status(200).json({message: 'Registration successful'});
    }
    catch(err){
        console.error('Error during the registration:', err);
        res.status(500).json({message: 'Registration failed'});
    }
})

mongoose.connect(url)
    .then(()=>{
        console.log("Connected To MongoDb");
    })
    .catch((err)=>{
        console.log("Failed To Connect",err);
    });
    

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
    
        try {
            const user = await User.findOne({ username });
    
            if (!user) {
                return res.status(400).json({ message: 'Invalid username' });
            }
    
            const isPasswordValid = await bcrypt.compare(password, user.password);
    
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }
    
            res.status(200).json({ message: 'Login successful' });
    
        } catch (err) {
            console.error('Error during login:', err);
            res.status(500).json({ message: 'Login failed due to a server error' });
        }
    });










app.listen(4000,()=>{
    console.log('Server is running on port http://localhost:4000/');
})