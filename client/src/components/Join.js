import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { useAlert } from 'react-alert';


let socket;

function Join() {
  const alert = useAlert();
  const [room, setRoom] = useState([
    Math.floor(Math.random() * (9999 - 1000)) + 1000,
  ]);
  const [name, setName] = useState(
    `Player${[Math.floor(Math.random() * (99999 - 1000)) + 1000]}`
  );
  const [canContinueCreate, setcanContinueCreate] = useState(false);
  const [roomsAvailable, setRoomsAvailable] = useState([]);

  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('getRoomsAvailable', null, (callback) => {
      if (callback) {
        setRoomsAvailable(callback);
      }
    });
    return () => {
      socket.close();
    };
  }, []);

  const createRoom = () => {
    socket.emit('getRoom', room, (callback) => {
      if (callback) {
        if (typeof callback === 'object') {
          setcanContinueCreate(true);
        } else {
          alert.error(`Room ${room} already exists.`);
        }
      }
    });
  };

  useEffect(() => {
    socket.on('roomsAvailable', (roomData) => {
      setRoomsAvailable(roomData);
    });
  });

  return (
    <div>
      <div className='login-wrapper'>
        <div className='login-card'>
          <h3>Log In</h3>
          <label htmlFor='nickname'>Nickname</label>
          <input id='nickname' value={name} type='text' onChange={(event) => setName(event.target.value)} />
          <label htmlFor='create-room'>Create Room</label>
          <input id='create-room' type='number' value={room} onChange={(event) => setRoom(event.target.value)}  />
          <button onClick={createRoom}>Create Room</button>
          <label>Available Rooms: </label>
          <div className='badge-wrapper'>
            {roomsAvailable.map((value, index) => {
              return (
                  <Link key={index} to={`/game?room=${value}&name=${name}`} className='badge'>
                    {value}
                  </Link>
              );
            })}
          </div>
        </div>
      </div>
      {canContinueCreate ? (
        <Redirect to={`/game?room=${room}&name=${name}`} />
      ) : null}
    </div>
  );
}

export default Join;
