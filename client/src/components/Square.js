import React from "react";

function Square(props) {
  return (
    <div className='board-cell' id={props.id} onClick={props.handleClick}>
      {props.value}
    </div>
  );
}

export default Square;
