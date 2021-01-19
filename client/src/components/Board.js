import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router';
import queryString from 'query-string';
import io from 'socket.io-client';
import useStateWithCallback from 'use-state-with-callback';
import { useAlert } from 'react-alert';

import InfoBar from './InfoBar';
import Square from './Square';
import ModalAlert from './ModalAlert';


let socket;
let clicked = false;

function Board({ location }) {
  const alert = useAlert();
  const [show, setShow] = useState(false);
  const [modal, setModal] = useState('');
  const [leave, setLeave] = useState(false);
  const [room, setRoom] = useState('');
  const [myStats, setMyStats] = useState({});
  const [oponentStats, setOponentStats] = useState([]);
  const [currentRoom, setCurrentRoom] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [fullRoom, setFullRoom] = useState(false);
  const [turn, setTurn] = useState('');
  const [result, setResult] = useState(null);
  const [squares, setSquares] = useStateWithCallback(
    '',
    () => {
      if (socket && clicked) {
        const playerId = oponentStats.id;
        const currentTurn = turn;
        socket.emit('nextTurn', { room, squares, playerId, currentTurn });
        clicked = false;
      }
    }
  );

  useEffect(() => {

    const { name, room  } = queryString.parse(location.search);

    socket = io('http://localhost:5000');

    socket.emit('join', { name, room }, (callback) => {

      if (callback) {
        if (typeof callback === 'string') {
          setErrorMsg(callback);
        } else {
          setMyStats({
            id: callback.id,
            name: callback.name,
            room: callback.room,
            player: callback.player,
            type: callback.type,
          });
          if (callback.currentRoom.length === 2) {
            setOponentStats({
              id: callback.currentRoom[0].id,
              name: callback.currentRoom[0].name,
              room: callback.currentRoom[0].room,
              player: callback.currentRoom[0].player,
              type: callback.currentRoom[0].type,
            });
          }
          setRoom(callback.room);
          setCurrentRoom(callback.currentRoom);
        }
      }
    });
  }, [location.search]);

  useEffect(() => {
    socket.on('getSquaresObj', (getSquaresObj) => {
      if (Array.isArray(getSquaresObj)) {
        setSquares(getSquaresObj);
      }
    });
  }, [setSquares]);

  useEffect(() => {
    if (currentRoom.length === 2) {
      setFullRoom(true);
      socket.emit('getTurn', room);
    } else {
      setFullRoom(false);
    }
    socket.on('roomData', (roomData) => {
      if (roomData) {
        if (roomData.currentRoom.length > 1) {
          const oponent = myStats.id === roomData.currentRoom[0].id ? 1 : 0;
          setOponentStats({
            id: roomData.currentRoom[oponent].id,
            name: roomData.currentRoom[oponent].name,
            room: roomData.currentRoom[oponent].room,
            player: roomData.currentRoom[oponent].player,
            type: roomData.currentRoom[oponent].type,
          });
        }
        setCurrentRoom(roomData.currentRoom);
      }
    });
  }, [myStats, currentRoom, room]);

  useEffect(() => {
    socket.on('leave', () => {
      alert.error('The opponent quit. The room has been closed.');
      setLeave(true);
    });
  }, [alert]);

  useEffect(() => {
    socket.on('sendTurn', (sendTurn) => {
      if (sendTurn) {
        setTurn(sendTurn);
      }
    });
    return () => socket.close();
  }, []);


  useEffect(() => {
    socket.on('sendResult', (result) => {
      if (result) {
        setResult(result);
      }
    });
    socket.on('sendSquares', (squares) => {
    setSquares(squares);
    if (result) {
      setShow(true);
      if (result === 'draw') {
        setModal('It\'s a draw');
      } else {
        let winner = myStats.type ? myStats.name : oponentStats.name;
        setModal(`Winner is ${winner}!`);
      }
    }
  });
}, [result, setSquares, myStats, oponentStats, alert]);

  const leaveRoom = () => {
    socket.emit('leaveRoom');
    alert.success('The room has been leaved.');
    setLeave(true);
  };

  const handleClick = (event) => {
    if (
      myStats.id === turn &&
      squares[event.target.id] === null &&
      clicked === false
    ) {

      clicked = true;

      const id = event.target.id;
      const type = myStats.type;

      socket.emit('sendSquares',{ room, id, type })
    }
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div className='game-wrapper'>
      <p>{errorMsg}</p>
      <div className='game'>
        {!Array.isArray(squares) ? <p>Loading</p> : squares.map((square, key) => (
          <Square key={key} id={key} value={square} handleClick={handleClick} />
        ))}
      </div>
      <button onClick={leaveRoom}>Leave Room</button>
        {errorMsg === '' ? (
          <InfoBar currentRoom={currentRoom} yourID={myStats.id} turn={turn} />
        ) : null}
        {leave ? <Redirect to='/' /> : null}
        { (modal) ? (
          <ModalAlert
              show={show}
              handleClose={handleClose}
              title={`${modal}`}
              body={`You Won!`}
              button='Leave the Room'
              action={leaveRoom}
            />
        ) : null}
        <p style={{ display: 'none' }}>{fullRoom}</p>
    </div>
  );
}

export default Board;
