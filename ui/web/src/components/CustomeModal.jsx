import { Modal } from "flowbite-react";

const CustomModal = ({ showModal, onClose, children }) => {
  return (
    <Modal show={showModal} onClose={onClose}>
      <Modal.Header>Request Access</Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
    </Modal>
  );
};

export default CustomModal;
