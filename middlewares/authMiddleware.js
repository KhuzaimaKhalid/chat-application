const jwt = require('jsonwebtoken')

const verifytoken = (req,res,next) =>{
    let token;
    let authHeader = req.headers.authorization || req.get('Authorization');
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1]

        if(!token){
            return res.status(401).json({message: "Access Denied, No token provided"})
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
            console.log("Decoded User:", decoded)
            next()
            
        } catch (error) {
            res.status(400).json({message: "Invalid Token"})
        }
    } else{
        return res.status(401).json({message: "Access Denied, No token provided"})
    }
}

module.exports = verifytoken;