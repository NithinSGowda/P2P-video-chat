const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/screen', (req, res) => {
  res.redirect(`/${uuidV4()}/screen`)
})
app.get('/video', (req, res) => {
  res.redirect(`/${uuidV4()}/video`)
})

app.get('/:room/screen', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
app.get('/:room/video', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

app.get('/', (req, res) => {
  res.render('landingPage',{roomId: false})
})
app.get('/:room', (req, res) => {
  res.render('landingPage',{roomId: req.params.room})
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||8080)