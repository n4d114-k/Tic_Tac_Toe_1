const express = require('express')
const useSocket = require('socket.io')
const cors = require('cors')
const path = require('path')
const config = require('config')

const PORT = config.get('port') || 5000

const app = express()
const server = require('http').createServer(app)
const io = useSocket(server, {cors: {origin: '*'}})


app.get("/", (req, res) => {
    res.send({ response: "Server is up and running." }).status(200);
});

const {
  squaresObj,
  addToSquaresObj,
  removeFromSquaresObj,
  getSquaresObj,
  setSquaresObjArray,
  addUser,
  removeUser,
  removeUserByID,
  calculateResult,
  getTurn,
  nextTurn,
} = require('./functions.js')

io.on('connect', (socket) => {
  console.log(`Connection to server established with socket.id: ${socket.id}`)

  const roomsAvailable = Object.keys(rooms).filter(
    (key) => key !== 'roomStep'
  )

    socket.on('getRoom', (room, callback) => {
    addToSquaresObj(room)
    console.log(squaresObj)
    const roomExists = Object.keys(rooms).filter((element) => {
      return element === room
    })
    if (roomExists.length > 0) {
      return callback(room)
    } else {
      return callback({ error: `Room ${room} does not exist.` })
    }
  })

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room })
    if (error) return callback(error)
    socket.join(user.room)
    io.in(user.room).emit('getSquaresObj', getSquaresObj(room))
    socket.broadcast.to(user.room).emit('roomData', user)
    const roomsAvailable = Object.keys(rooms).filter(
      (key) => key !== 'roomStep'
    )
    socket.broadcast.emit('roomsAvailable', roomsAvailable)
    console.log('Available rooms:', rooms)
    if (user) return callback(user)
  })

  socket.on('getTurn', (room) => {
    console.log(`Get turn in ${room}`)
    const sendTurn = getTurn(room)
    socket.to(room).emit('sendTurn', sendTurn)
    console.log(sendTurn)
  })

  socket.on('nextTurn', ({ room, squares }) => {
    console.log(`Next turn ${room}`)
    const sendTurn = nextTurn(room)
    setSquaresObjArray(room, squares)
    const result = calculateResult(squares)
    io.in(room).emit('sendTurn', sendTurn)
    io.in(room).emit('sendResult', result)
    io.in(room).emit('sendSquares', squares)
  })

  socket.on('sendSquares', ({room, id, type}) => {
    setSquaresObjArray(room, id, type)
    io.in(room).emit('sendSquares', getSquaresObj(room))
  })

  socket.on('leaveRoom', () => {
    const { roomData } = removeUser(socket, socket.id)
    const roomsAvailable = Object.keys(rooms).filter(
      (key) => key !== 'roomStep'
    )
    console.log([...socket.rooms][1]);
    const roomToRemove = [...socket.rooms][1]
    removeFromSquaresObj(roomToRemove)
    socket.broadcast.emit('roomsAvailable', roomsAvailable)
  })

  socket.on('disconnect', () => {
    const roomData = removeUserByID(socket.id)
    socket.broadcast.to(roomData).emit('leave')
    const roomsAvailable = Object.keys(rooms).filter(
      (key) => key !== 'roomStep'
    )
    socket.broadcast.emit('roomsAvailable', roomsAvailable)
    console.log('User logged out.')
  })

  socket.on('getRoomsAvailable', (data, callback) => {
    return callback(roomsAvailable)
  })
})

app.use(cors())
/*
app.use(express.static(path.join(__dirname, 'build')))
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})
*/

server.listen(PORT, (err) => {
  if (err) {
    throw Error(err)
  }
  console.log(`App has been started on port ${PORT}`)
})
