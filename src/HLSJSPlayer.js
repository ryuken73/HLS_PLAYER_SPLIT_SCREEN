import React from 'react';
import styled from 'styled-components';
import ReactHlsPlayer from 'react-hls-player/dist';
import usePrevious from './hooks/usePrevious';
import {isPlayerPlaying} from './lib/sourceUtil';

const Conatiner = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: black;
`;
const Cover = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  /* background-color: maroon; */
  background-color: ${props => props.isActive ? 'red': props.paused ? 'black' : 'maroon'};
  display: ${props => !props.autoPlay && 'none'};
`
const NumDisplay = styled.div`
  display: ${props => !props.show && 'none'};
  position: absolute;
  top: ${props => (props.position === 'topLeft' || props.position === 'topRight') && '10px'};
  bottom: ${props => (props.position === 'bottomLeft' || props.position === 'bottomRight') && '10px'};
  left: ${props => (props.position === 'topLeft' || props.position === 'bottomLeft') && '10px'};
  right: ${props => (props.position === 'topRight' || props.position === 'bottomRight') && '10px'};
  /* background: ${props => props.isActive ? 'darkblue' : 'black'}; */
  background: black;
  width: 80px;
  padding: 5px;
  z-index: 1000;
  line-height:1em; 
  vertical-align:top;
`
const CustomPlayer = styled(ReactHlsPlayer)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const hlsConfig = {
  enableWorker: false,
  debug: false,
  backBufferLength: 0,
  liveBackBufferLength: 0,
  liveMaxBackBufferLength: 0,
  maxBufferSize: 10,
  maxBufferLength: 10 * 1000 * 1000,
}

const CHECK_INTERNAL_SEC = 2;

const getRandomCountdown = refreshInterval => {
    return Math.ceil(refreshInterval + Math.random() * 20);
};

function HLSJSPlayer(props) {
  const {
    autoPlay,
    player=null,
    source,
    setPlayer,
    lastLoaded,
    cctvIndex,
    currentIndexRef,
    autoRefresh,
    refreshMode,
    refreshInterval,
    currentCCTVIndex
  } = props;
  const playerRef = React.useRef(null);
  const {url} = source

  const prevRefreshInterval = usePrevious(refreshInterval);
  const isRefreshIntervalChanged = prevRefreshInterval !== refreshInterval;
  const RELOAD_COUNTDOWN = getRandomCountdown(refreshInterval)
  const [currentCountDown, setCurrentCountDown] = React.useState(RELOAD_COUNTDOWN);
  // const [lastReloadTime, setLastReloadTime] = React.useState(Date.now());
  const [src, setSrc] = React.useState(url);
  // const isActive = !autoRefresh ? true : cctvIndex === currentIndexRef.current;
  const isActive = !autoRefresh ? true : cctvIndex === currentCCTVIndex;

  const onLoadDataHandler = React.useCallback((event) => {
    console.log('^^^',event)
    event.target.play(); 
  }, [])

  React.useEffect(() => {
    console.log('HLSJS Player mount')
    return () => console.log('HLSJS Player umount')
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

  React.useEffect(() => {
    console.log('player stalled. reload player:',lastLoaded,cctvIndex)
    setSrc(src => {
      const prevSrc = src;
      setTimeout(() => {
        setSrc(prevSrc)
      },200);
      return null;
    })
  }, [cctvIndex, lastLoaded])

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
  const paused = !isPlayerPlaying(playerRef.current, cctvIndex, 'apply paused style');

  const numDisplayContent = refreshMode === 'auto' ? currentCountDown : 0;

  return (
    <Conatiner>
      <Cover isActive={isActive} paused={paused} autoPlay={autoPlay}></Cover>
      <NumDisplay isActive={isActive} show={autoRefresh} position={'topLeft'}>{numDisplayContent}</NumDisplay>
      <NumDisplay isActive={isActive} show={autoRefresh} position={'topRight'}>{numDisplayContent}</NumDisplay>
      <NumDisplay isActive={isActive} show={autoRefresh} position={'bottomLeft'}>{numDisplayContent}</NumDisplay>
      <NumDisplay isActive={isActive} show={autoRefresh} position={'bottomRight'}>{numDisplayContent}</NumDisplay>
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