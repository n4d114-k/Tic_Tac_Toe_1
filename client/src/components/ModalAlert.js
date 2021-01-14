import React from "react";
import { Modal, Button } from "react-bootstrap";

function ModalAlert(props) {
  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button onClick={props.action}>
          {props.button}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalAlert;
