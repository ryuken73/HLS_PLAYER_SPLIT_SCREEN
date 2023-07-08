import React from 'react'
import styled from 'styled-components';
import usePrevious from './hooks/usePrevious';

const Container = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
`
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
const CustomVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const getRandomCountdown = refreshInterval => {
    return Math.ceil(refreshInterval + Math.random() * 20);
};

const CHECK_INTERNAL_SEC = 2;

const MP4Player = (props) => {
    const {
      source={}, 
      cctvIndex, 
      currentIndexRef, 
      autoRefresh=false, 
      setPlayer, 
      lastLoaded,
      refreshMode,
      refreshInterval,
      reloadPlayerComponent
    } = props;
    const prevRefreshInterval = usePrevious(refreshInterval);
    const isRefreshIntervalChanged = prevRefreshInterval !== refreshInterval;
    const RELOAD_COUNTDOWN = getRandomCountdown(refreshInterval)
    const [currentCountDown, setCurrentCountDown] = React.useState(RELOAD_COUNTDOWN);
    const [lastReloadTime, setLastReloadTime] = React.useState(Date.now());
    const videoRef = React.useRef(null);
    // const [loadDateTime, setLoadDateTime] = React.useState(null);
    const {url} = source;

    // const isActive = autoRefresh ? true : cctvIndex === currentIndexRef.current;

    // React.useEffect(() => {
    //     const reloadTimer = setTimeout(() => {
    //         console.log('isActive=', isActive, cctvIndex);
    //         setLoadDateTime(Date.now());
    //     // }, 3600000 + Math.random()*200000)
    //     }, 120000 + Math.random() * 200000)
    //     return () => {
    //         clearTimeout(reloadTimer);
    //     }
    // }, [loadDateTime, isActive, cctvIndex])

    React.useEffect(() => {
      if(refreshMode !== 'auto'){
        return;
      }
      if(isRefreshIntervalChanged){
        setCurrentCountDown(getRandomCountdown(refreshInterval))
      }
      const timer = setInterval(() => {
        console.log('current time=', cctvIndex);
        setCurrentCountDown(currentCountDown => {
            return currentCountDown - CHECK_INTERNAL_SEC;
        })
      }, CHECK_INTERNAL_SEC * 1000)
      return () => {
        clearInterval(timer);
      }
    }, [cctvIndex, refreshMode, isRefreshIntervalChanged, refreshInterval])

    if(autoRefresh) {
      const countdown = Math.ceil(currentCountDown);
      console.log('####', countdown)
      if(countdown <= 0){
        setCurrentCountDown(RELOAD_COUNTDOWN);
        reloadPlayerComponent(cctvIndex);
        // setLastReloadTime(Date.now());
      }
    }

    React.useEffect(() => {
      console.log('reload mp4 player:', lastLoaded)
      if(videoRef.current === null){
        return;
      }
      videoRef.current.load();
    }, [lastLoaded]);

    const handleLoadedMetadata = React.useCallback(event => {
      console.log(lastLoaded)
      if(videoRef.current === null){
        return;
      }
      console.log('loadedMetadata mp4', videoRef.current.duration);
      if(!isNaN(videoRef.current.duration)){
          videoRef.current.play();
      }
      setPlayer(cctvIndex, videoRef.current)
    }, [cctvIndex, lastLoaded, setPlayer]);

    React.useEffect(() => {
      if(videoRef.current === null){
        return;
      }
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      // videoRef.current.addEventListener('ended', reloadPlayer)
      return () => {
        if(videoRef.current){
            videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
            // videoRef.current.removeEventListener('ended', reloadPlayer)
        }
      }
    }, [handleLoadedMetadata]) 

  return (
    <Container>
      <NumDisplay show={autoRefresh} position={'topLeft'}>{currentCountDown}</NumDisplay>
      <NumDisplay show={autoRefresh} position={'topRight'}>{currentCountDown}</NumDisplay>
      <NumDisplay show={autoRefresh} position={'bottomLeft'}>{currentCountDown}</NumDisplay>
      <NumDisplay show={autoRefresh} position={'bottomRight'}>{currentCountDown}</NumDisplay>
      <CustomVideo muted ref={videoRef} src={url} crossOrigin="anonymous"></CustomVideo>
    </Container>
  )
}

export default React.memo(MP4Player);