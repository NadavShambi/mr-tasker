const express = require('express')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

const app = express()
const http = require('http').createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true
    }
    app.use(cors(corsOptions))
}


const taskRoutes = require('./api/task/task.routes')
const socketService = require('./services/socket.service')

// routes


app.use('/api/task', taskRoutes)
socketService.setupSocketAPI(http)
// socketService.setUp(server, cors)
// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/task/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


const port = process.env.PORT || 3030
http.listen(port, () => {
})

// app.listen(port, () => {
//     console.log(`App listening on port ${port}!`)
// });
