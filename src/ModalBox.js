import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box'
// import { makeStyles } from '@mui/material/styles';
import styled, {css, keyframes} from 'styled-components';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import Grow from '@mui/material/Grow';

// const useStyles = makeStyles((theme) => ({
//   paper: props => ({
//     margin: 'auto',
//     height: props.contentHeight || "80%",
//     width: props.contentWidth || "90%",
//     // backgroundColor: theme.palette.background.paper,
//     backgroundColor: props.autoPlay ? "maroon" : "white",
//     border: '2px solid #000',
//     boxShadow: theme.shadows[100],
//     padding: theme.spacing(0.5),
//   }),
// }));

// const TRANSLATE_RATIO_MAP = {
//   2 : ['-50%', '50%'],
//   3 : ['-50%', '0%', '50%']
// }

// const getTranslateRate = (gridNum, gridDimension) => {
//   const x = Math.floor(gridNum / gridDimension);
//   const y = gridNum % gridDimension;
//   const translateMap = TRANSLATE_RATIO_MAP[gridDimension];
//   console.log('####',x,y)
//   return [translateMap[y], translateMap[x]]
// }

// const redBg = keyframes`
//   0% {
//     opacity: 0;
//   }
//   100% {
//     opacity: 1;
//   }
// `

// const animationRule = css`
//   animation: ${redBg} 0.5s linear;
// `;

// const animationDuration = 0.5;

const ModalContainer = styled.div`
  margin: auto;
  height: ${props => props.contentHeight || "80%"};
  width: ${props => props.contentWidth || "90%"};
  background-color: ${props => props.autoPlay ? "maroon" : "white"};
  border: 2px solid #000;
  padding: 5px;
  // opacity: 0.5;
  // filter: blur(10px);
  // transform: ${props => `translate(${props.trX},${props.trY}) scale(1%)`};
  /* transform: translate(-50%,-50%) scale(1%); */
  /* transform: translate(0%,50%) scale(20%); */
  /* boxShadow: theme.shadows[100], */
  /* padding: theme.spacing(0.5), */
`

function SimpleModal(props) {
  // const classes = useStyles(props);
  const {children, currentGridNum, gridDimension} = props;
  console.log('### modal:', props)
  const {open, setOpen, autoPlay} = props;
  // const [fadeIn, setFadeIn] = React.useState(open);
  // const [trX, trY] = getTranslateRate(currentGridNum, gridDimension);
  // React.useEffect(() => {
  //   !open && setFadeIn(false);
  // },[open])
  // React.useEffect(() => {
  //   if(!open){
  //     return;
  //   }
  //   setFadeIn(false);
  //   setTimeout(() => {
  //     setFadeIn(true)
  //   },animationDuration*1000)
  // },[currentGridNum, open])

  const handleClose = () => {
    setOpen(false);
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
        {/* <Grow in={open} timeout={1500}> */}
        {/* <Fade in={open} timeout={500}>  */}
          <Box onClick={handleClose} display="flex" height="100%">
            {/* <Box className={classes.paper}> */}
            {/* <ModalContainer fadeIn={fadeIn} trX={trX} trY={trY} {...props}> */}
            <ModalContainer {...props}>
              <Box>
                {children}
              </Box>
            </ModalContainer>
          </Box>
        {/* </Fade> */}
        {/* </Grow> */}
        </Zoom>
      </Modal>
    </Box>
  );
}

export default React.memo(SimpleModal);