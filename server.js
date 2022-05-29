const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const JWT_SECRET = '904r13kln4nlkcxg9009g89cvxnlkqasdhjgvcs89cx0900xc0x0c+er9#¤!%gcsg13gcg89f'

mongoose.connect('mongodb://localhost/project1');



const app = express()
app.set('view engine', 'ejs')
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(express.json());
app.use(cors());

app.post('/api/change-sub', async(req, res) => {
    const {token, newSubscribe: subscription} = req.body

    try{
        const user = jwt.verify(token, JWT_SECRET)
        const _id = user.id
        await User.updateOne(
            {_id},
            {
                $set: {subscription}
            }
        )
        res.json({status:'ok'})
    } catch(error){
        console.log(error)
        res.json({status:'error', error:';))'})
    }
})

app.post('/api/login', async (req,res) => {
    const {email, password} = req.body
    const user = await User.findOne({ email }).lean()

    if(!user){
        return res.json({status:'error', error:'Invalid email/password'})
    }

    if(await bcrypt.compare(password, user.password)){
        
        const token = jwt.sign(
            {
                id:user._id,
                email: user.email
            },
            JWT_SECRET
        )
        
        return res.json({status:'ok', data: token})
    }

    res.json({status:'error', error: 'Invalid email/password'})
})

app.post('/api/register', async (req,res) => {
    console.log(req.body)

    const {email, subscription, password: plainPassword} = req.body

    if(!email || typeof email !== 'string'){
        return res.json({status: 'error', error: 'Please enter an E-mail'})
    }

    if(!plainPassword || typeof plainPassword !== 'string'){
        return res.json({status: 'error', error: 'Please enter a password'})
    }

    if(plainPassword.length<5){
        return res.json({status:'error', error: 'Password too short, should be alteast 6 characters'})
    }

    const password = await bcrypt.hash(plainPassword, 10)

    console.log(await bcrypt.hash(plainPassword, 10))

    try{
        const response = await User.create({
            email,
            password,
            subscription
        })
        console.log('user created', response)
    }catch(error){
        if(error.code === 11000){
            console.log(JSON.stringify(error))
            return res.json({status: 'error', error: 'E-mail already in use'})
    }
    throw error;
    }

    res.json({status:'ok'})
})

app.get('/', async (req, res) =>{

    const reject = () => {
        res.setHeader('www-authenticate', 'Basic')
        res.sendStatus(401)
    }
    const authorization = req.headers.authorization

    if(!authorization){
        return reject()
    }
    const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

    if(!(username === 'admin' && password === 'admin')){
        return reject()
    }else{
        const users = await User.find().sort({
        email: 'desc'})
    res.render('admin', {users: users})
    }   
})

app.listen(3000, () => {
    console.log('server is now up')
})