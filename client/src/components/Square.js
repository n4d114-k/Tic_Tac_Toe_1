import React from "react";

function Square({id, value, handleClick}) {
  return (
    <div className='board-cell' id={id} onClick={handleClick}>
      {value}
    </div>
  );
}

export default Square;
