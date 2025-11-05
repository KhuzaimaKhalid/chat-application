const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require("socket.io")
const dotenv = require('dotenv').config()
const dbConnect = require('./db/connect')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');
const verifyToken = require('./middlewares/authMiddleware');
const mongoose = require('mongoose');
const Chat = require('./models/chat');
const User = require('./models/userModel')
//const io = new Server(server);


async function main() {
    try {
        await dbConnect();
        console.log("Connected to MongoDB")
        // User debugging code 
        // console.log("in main")
        // const existing = await User.findOne({ username: 'test1user' });
        // if (!existing) {
        //     const user = new User({
        //       username: 'test1user',
        //       password: '12345',
        //       role: 'user'
        //     });
        //     await user.save();
        //     console.log('Test user created');
        //   } else {
        //     console.log('Test user already exists');
        //   }
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
    const app = express()
    const server = createServer(app);
    app.use(express.static(join(__dirname, 'public')));
    app.use(express.static(join(__dirname, 'views')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.set('view engine', 'ejs')
    
    app.use('/api/auth/', authRoutes);
    
   

    const io = new Server(server, {
        connectionStateRecovery: {}
    });

    app.get('/',  (req, res) => {
        res.sendFile(join(__dirname, 'public/index.html'));
    })

    io.on('connection', async (socket) => {
        console.log('user connected ' + socket.id)
       
        socket.on('chat message', async (msg) => {
           
            try {
            //     const user = new User({
            //        username: username,
            //         password: password,
            //     })
            //    await user.save();
    //         const { username, password } = req.body;
    //         const user = new User({ username, password });
    // await user.save(); // Save user to database if needed

    // const user = new User({
    //     username : username.req.body
    // })
    // const saveduser = await user.save();
    // console.log("User saved:", saveduser);

    // const testUser = await User.findOne({ username: 'test1user' });
    // console.log("Test User:", testUser);

     // Get the currently logged-in user from the session/token
        // Since you have JWT auth, we need to get the user from the token
        const token = socket.handshake.auth?.token || 
                     socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        let username = 'anonymous';
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const currentUser = await User.findById(decoded.id);
                if (currentUser) {
                    username = currentUser.username;
                }
            } catch (error) {
                console.log("Invalid token, using anonymous");
            }
        }

        console.log("Message from user:", username); // This will show the actual username
                const chat = new Chat({
                    content: msg,
                  // user: 'anonymous'
                //   user: user.username
                user: username
                })
                const savedChat = await chat.save();
              
                io.emit('chat message', msg,chat.user, savedChat._id.toString());
            } catch (err) {
                console.log(err + "  error saving chat")
                socket.emit(" error to send message to server")
            }
        })

        if (!socket.recovered) {
            try {
                const serverOffset = socket.handshake.auth.serverOffset || '000000000000000000000000';
                const chats = await Chat.getMessagesAfterOffset(serverOffset);

                // Send each missed message to the reconnected client
                chats.forEach((chat) => {
                    socket.emit('chat message', chat.content, chat._id.toString());
                });

                console.log(`Sent ${chats.length} missed messages to ${socket.id}`);
            } catch (error) {
                console.error('Failed to retrieve messages:', error);
            }
        }
        socket.on('disconnect', () => {
            console.log('user disconnected ' + socket.id)
        })

    })


const port = 7000
    server.listen(7000, () => {
        console.log(`Server is running on port ${port}`)
    })

    process.on('SIGINT', async () => {
        console.log('\nShutting down gracefully...');
        await mongoose.connection.close();
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });

}

main().catch(console.error);



