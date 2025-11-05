const express = require('express')
const {register,login} = require('../controllers/authController')
const router = express.Router()


router.get('/register', (req,res)=>{
    res.render('index')
})
router.get('/login', (req,res)=>{
    res.render('login')
})

router.post('/register', register)
router.post('/login', login)

module.exports = router