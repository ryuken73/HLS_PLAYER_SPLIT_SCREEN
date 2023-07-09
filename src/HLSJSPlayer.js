import React from 'react';
import styled from 'styled-components';
import ReactHlsPlayer from 'react-hls-player/dist';

const Conatiner = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: black;
`;
const CustomPlayer = styled(ReactHlsPlayer)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`


function HLSJSPlayer(props) {
  const {
    player=null,
    source,
    setPlayer,
    cctvIndex,
    currentIndexRef,
    autoRefresh,
    refreshMode,
    refreshInterval
  } = props;
  const playerRef = React.useRef(null);
  const {url} = source

  React.useLayoutEffect(() => {
    // if(playerRef.current === null){
    //   return;
    // }
    setPlayer(cctvIndex, playerRef.current);
    playerRef.current.addEventListener('loadedmetadata', () => {
      playerRef.current.play(); 
    })
  }, [cctvIndex, setPlayer])

  const hlsConfig = {
    enableWorker: true
  }
  return (
    <Conatiner>
      <CustomPlayer
        src={url}
        autoPlay={true}
        controls={false}
        playerRef={playerRef}
        hlsConfig={hlsConfig}
        muted={true}
        width="100%"
        height="100%"
      ></CustomPlayer>
    </Conatiner>
  )
}

export default React.memo(HLSJSPlayer);