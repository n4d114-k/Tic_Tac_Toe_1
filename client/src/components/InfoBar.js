import React, { useState, useEffect } from "react";


function InfoBar({ currentRoom, yourID, turn }) {
  const [player1, setPlayer1] = useState([]);
  const [player2, setPlayer2] = useState([]);

  useEffect(() => {
    if (typeof currentRoom[0] === "object") {
      const player_1 = Object.values(currentRoom[0]);
      setPlayer1(player_1);
    }
    if (typeof currentRoom[1] === "object") {
      const player_2 = Object.values(currentRoom[1]);
      setPlayer2(player_2);
    } else {
      setPlayer2([null, "Waiting for the another player ...", null, null]);
    }
  }, [currentRoom]);

  const gameTurn = (player) => {
    if (turn === player) {
      if (yourID === player) {
        return <em>Your turn</em>;
      } else {
        return <em>Waiting for the opponent...</em>;
      }
    }
  };

  return (
    <div className='info-bar'>
      <div>
        <p>{player1[1]}<br />{gameTurn(player1[0])}</p>
      </div>
      <div>
        <p>{player2[1]}<br />{gameTurn(player2[0])}</p>
      </div>
    </div>
  );
}

export default InfoBar;
