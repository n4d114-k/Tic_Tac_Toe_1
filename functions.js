rooms = {}

let squaresMap = new Map()


const addToSquaresMap = (room) => {
  squaresMap.set(room[0], Array(9).fill(null))
  return squaresMap
}

const removeFromSquaresMap = (room) => {
  squaresMap.delete(room)
  return squaresMap
}

const getSquaresMap = (room) => {
  return squaresMap.get(room)
}

const setSquaresMapArray = (room, squares) => {
  squaresMap.delete(room)
  squaresMap.set(room, squares)
  return squaresMap
}

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase()
  room = room.trim().toLowerCase()
  if (!rooms.hasOwnProperty(room)) {
    rooms[room] = []
  }

  if (!name || !room) return { error: 'Nickname and Room are required.' }
  if (rooms[room].length > 1) {
    return { error: 'This room is already full.' }
  }
  const existingUser = rooms[room].filter((user) => user.name === name)
  if (existingUser.length > 0) {
    name = `${name}_2`
  }

  let step = -1
  let type = 'X'
  let player = 1
  if (rooms[room].length > 0) {
    player = 2
    step = Math.round(Math.random())
    if (rooms[room][0].type === 'X') {
      type = 'O'
    } else {
      type = 'X'
    }
  }

  rooms['roomStep'] = { ...rooms['roomStep'], [room]: step }
  rooms[room].push({ id, name, room, type, player })
  const user = {
    id,
    name,
    room,
    type,
    player,
    currentRoom: rooms[room],
    roomStep: rooms['roomStep'][room]
  }

  console.log(`${name} with socket.id:${id} entered the room: ${room}`)
  return { user }
}

const removeUser = (socket) => {
  let roomData = {}
  Object.keys(rooms).forEach((key, index) => {
    if (key !== 'roomStep') {
      delete rooms[Object.values(socket.rooms)[0]]
      delete rooms['roomStep'][Object.values(socket.rooms)[0]]
      console.log(rooms, ' from removeUser')
      socket.broadcast.to(Object.values(socket.rooms)[0]).emit('leave')
    }
  })
  return { roomData }
}

const removeUserByID = (id) => {
  let roomData = ''
  Object.keys(rooms).forEach((key, index) => {
    if (key !== 'roomStep') {
      let foundID = rooms[key].findIndex((element) => element.id === id)
      if (foundID !== -1) {
        delete rooms[key]
        delete rooms['roomStep'][key]
        roomData = key
      }
    }
  })
  return roomData
}

  const calculateWinner = (squares) => {

    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a]
      }
    }
    return null

  }

  const getTurn = (room) => {
    let turn = ''
    if (room !== '') {
      let step = rooms['roomStep'][room]
      if (typeof rooms[room][step % 2] !== 'undefined') {
        if (rooms['roomStep'][room] !== -1) {
          turn = rooms[room][step % 2].id
        }
      }
    }
    return turn
}

const nextTurn = (room) => {
  let turn = ''
  if (room !== '') {
    let step = rooms['roomStep'][room]
    step = step + 1
    rooms['roomStep'][room] = step
    if (typeof rooms[room][step % 2] !== 'undefined') {
      if (rooms['roomStep'][room] !== -1) {
        turn = rooms[room][step % 2].id
      }
    }
  }
  return turn
}


module.exports = {
  squaresMap,
  addToSquaresMap,
  removeFromSquaresMap,
  getSquaresMap,
  setSquaresMapArray,
  addUser,
  removeUser,
  removeUserByID,
  calculateWinner,
  getTurn,
  nextTurn,
}
