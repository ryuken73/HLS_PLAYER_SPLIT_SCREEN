import React from 'react';
import styled from 'styled-components';
import ReactHlsPlayer from 'react-hls-player/dist';
import usePrevious from './hooks/usePrevious';

const Conatiner = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: black;
`;
const NumDisplay = styled.div`
  display: ${props => !props.show && 'none'};
  position: absolute;
  top: ${props => (props.position === 'topLeft' || props.position === 'topRight') && '10px'};
  bottom: ${props => (props.position === 'bottomLeft' || props.position === 'bottomRight') && '10px'};
  left: ${props => (props.position === 'topLeft' || props.position === 'bottomLeft') && '10px'};
  right: ${props => (props.position === 'topRight' || props.position === 'bottomRight') && '10px'};
  background: black;
  width: 80px;
  z-index: 1000;
`
const CustomPlayer = styled(ReactHlsPlayer)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const hlsConfig = {
  enableWorker: true,
  backBufferLength: 0,
  liveBackBufferLength: 0,
  liveMaxBackBufferLength: 0,
  maxBufferSize: 0,
  maxBufferLength: 5,
}

const CHECK_INTERNAL_SEC = 2;

const getRandomCountdown = refreshInterval => {
    return Math.ceil(refreshInterval + Math.random() * 20);
};

function HLSJSPlayer(props) {
  const {
    player=null,
    source,
    setPlayer,
    lastLoaded,
    cctvIndex,
    currentIndexRef,
    autoRefresh,
    refreshMode,
    refreshInterval,
    reloadPlayerComponent
  } = props;
  const playerRef = React.useRef(null);
  const {url} = source

  const prevRefreshInterval = usePrevious(refreshInterval);
  const isRefreshIntervalChanged = prevRefreshInterval !== refreshInterval;
  const RELOAD_COUNTDOWN = getRandomCountdown(refreshInterval)
  const [currentCountDown, setCurrentCountDown] = React.useState(RELOAD_COUNTDOWN);
  const [lastReloadTime, setLastReloadTime] = React.useState(Date.now());
  const [src, setSrc] = React.useState(url);
  const isActive = !autoRefresh ? true : cctvIndex === currentIndexRef.current;

  const onLoadDataHandler = React.useCallback((event) => {
    console.log('^^^',event)
    event.target.play(); 
  }, [])

  // React.useLayoutEffect(() => {
  //   console.log('reload mp4 player:', lastLoaded)
  //   if(playerRef.current === null){
  //     return;
  //   }
  //   playerRef.current.load();
  // }, [lastLoaded])

  React.useLayoutEffect(() => {
    // if(playerRef.current === null){
    //   return;
    // }
    setPlayer(cctvIndex, playerRef.current);
    playerRef.current.addEventListener('loadedmetadata', onLoadDataHandler);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      playerRef.current.removeEventListener('loadedmetadata', onLoadDataHandler);
    }
  }, [cctvIndex, onLoadDataHandler, setPlayer])

  React.useEffect(() => {
    if(refreshMode !== 'auto'){
      return;
    }
    if(isRefreshIntervalChanged){
      setCurrentCountDown(getRandomCountdown(refreshInterval))
    }
    const timer = setInterval(() => {
      if(player === null) {
        clearInterval(timer);
        return;
      }
      // console.log('current time=', cctvIndex, player);
      setCurrentCountDown(currentCountDown => {
          return currentCountDown - CHECK_INTERNAL_SEC;
      })
    }, CHECK_INTERNAL_SEC * 1000)
    return () => {
      clearInterval(timer);
    }
  }, [cctvIndex, player, refreshMode, isRefreshIntervalChanged, refreshInterval])

  if(autoRefresh) {
    const countdown = Math.ceil(currentCountDown);
    // console.log('####', countdown)
    if(countdown <= 0){
      if(isActive){
          //if active bypass reload
          setCurrentCountDown(RELOAD_COUNTDOWN);
          return;
      }
      // player.dispose();
      // setLastReloadTime(Date.now());
      setCurrentCountDown(RELOAD_COUNTDOWN);
      setSrc(src => {
        const prevSrc = src;
        setTimeout(() => {
          setSrc(prevSrc)
        },200);
        return null;
      })
    }
  }

  return (
    <Conatiner>
      <NumDisplay show={autoRefresh} position={'topLeft'}>{currentCountDown}</NumDisplay>
      <NumDisplay show={autoRefresh} position={'topRight'}>{currentCountDown}</NumDisplay>
      <NumDisplay show={autoRefresh} position={'bottomLeft'}>{currentCountDown}</NumDisplay>
      <NumDisplay show={autoRefresh} position={'bottomRight'}>{currentCountDown}</NumDisplay>
      <CustomPlayer
        src={src}
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