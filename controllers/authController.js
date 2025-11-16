const express = require('express')
const app = express()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;  
      //  console.log(req.body)
        const hashedpassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            password: hashedpassword,
            role
        })
        await newUser.save()
      //  console.log('before login route')
        res.redirect('/api/auth/login')
        res.status(201).json({ message: `User registered with username ${username}` })
     //  res.status(201).send('<script>alert("Registration successful! Please login."); window.location.href="/api/auth/login";</script>');
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' })
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json({ message: `User with username ${username} not found` })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn : "1h"}
        );
        
        // Set token as HTTP-only cookie
        res.cookie('token', token, { 
            httpOnly: false, 
            maxAge: 3600000 // 1 hour
        });
        
      
       // res.status(200).json({ token })
        //res.redirect('/')
        res.send('<script>window.location.href="/";</script>');
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' })
    }


}

module.exports = { register, login }