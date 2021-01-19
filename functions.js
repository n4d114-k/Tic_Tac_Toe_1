rooms = {}

let squaresObj = {}


const addToSquaresObj = (room) => {
  const roomId = room[0]
  squaresObj[roomId] = {board: Array(9).fill(null)}
  return squaresObj
}

const removeFromSquaresObj = (room) => {
  delete squaresObj[room]
  return squaresObj
}

const getSquaresObj = (room) => {
  return squaresObj[room].board
}

const setSquaresObjArray = (room, id, type) => {
  if (squaresObj[room].board[id] === null) {
    squaresObj[room].board[id] = type;
  }
  return squaresObj
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

  squaresObj[room]['roomStep'] = step
  rooms[room].push({ id, name, room, type, player })
  squaresObj[room][type] = { id, name, player }
  const user = {
    id,
    name,
    room,
    type,
    player,
    currentRoom: rooms[room],
    roomStep: squaresObj[room]['roomStep']
  }

  console.log(`${name} with socket.id:${id} entered the room: ${room}`)
  return { user }
}

const removeUser = (socket) => {
  let roomData = {}
  Object.keys(rooms).forEach((key, index) => {
    delete rooms[Object.values(socket.rooms)[0]]
    socket.broadcast.to(Object.values(socket.rooms)[0]).emit('leave')
  })
  return { roomData }
}

const removeUserByID = (id) => {
  let roomData = ''
  Object.keys(rooms).forEach((key, index) => {
    let foundID = rooms[key].findIndex((element) => element.id === id)
    if (foundID !== -1) {
      delete rooms[key]
      roomData = key
    }
  })
  return roomData
}

  const calculateResult = (squares) => {

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
    const hesEmptySquares = squares.findIndex((square) => !square) > -1;
    const winer = lines.find(([a, b, c]) => {
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[a] === squares[c]
        ) {
          return squares[a]
        }
    })
    if(winer) {
      return winer
    } else if (!hesEmptySquares) {
      return 'draw';
    }
    return null;
  }

  const nextTurn = (room, playerId, currentTurn) => {
    let turn = ''
    if (room !== '') {
        if (squaresObj[room]['roomStep'] !== -1) {
          turn = rooms[room][1].id === currentTurn ? rooms[room][0].id : rooms[room][1].id
        }
    }
    if(turn === playerId){
      return turn
    }
  }


module.exports = {
  squaresObj,
  addToSquaresObj,
  removeFromSquaresObj,
  getSquaresObj,
  setSquaresObjArray,
  addUser,
  removeUser,
  removeUserByID,
  calculateResult,
  nextTurn,
}
