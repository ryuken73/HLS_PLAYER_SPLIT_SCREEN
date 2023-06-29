import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box'
import styled, {css, keyframes} from 'styled-components';
import Zoom from '@mui/material/Zoom';

const ModalContainer = styled.div`
  margin: auto;
  height: ${props => props.contentHeight || "80%"};
  width: ${props => props.contentWidth || "90%"};
  background-color: ${props => props.autoPlay ? "maroon" : "white"};
  border: 2px solid #000;
  padding: 5px;
`

function SimpleModal(props) {
  const {children } = props;
  console.log('### modal:', props)
  const {open, setOpen, modalOpenRef} = props;

  const handleClose = () => {
    setOpen(false);
    modalOpenRef.current = false;
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        {...props}
      >
        <Zoom in={open} timeout={500}>
          <Box onClick={handleClose} display="flex" height="100%">
            <ModalContainer {...props}>
              <Box>
                {children}
              </Box>
            </ModalContainer>
          </Box>
        </Zoom>
      </Modal>
    </Box>
  );
}

export default React.memo(SimpleModal);