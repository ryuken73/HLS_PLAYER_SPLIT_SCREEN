import React from 'react'
import styled from 'styled-components';

const CustomVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const MP4Player = (props) => {
    const {source={}, cctvIndex, currentIndexRef, autoRefresh=false} = props;
    const videoRef = React.useRef(null);
    const [loadDateTime, setLoadDateTime] = React.useState(null);
    const {url} = source;

    const isActive = autoRefresh ? true : cctvIndex === currentIndexRef.current;

    React.useEffect(() => {
        const reloadTimer = setTimeout(() => {
            console.log('isActive=', isActive, cctvIndex);
            setLoadDateTime(Date.now());
        // }, 3600000 + Math.random()*200000)
        }, 120000 + Math.random() * 200000)
        return () => {
            clearTimeout(reloadTimer);
        }
    }, [loadDateTime, isActive, cctvIndex])

    const handleLoadedMetadata = React.useCallback(event => {
      console.log(loadDateTime)
      if(videoRef.current === null){
        return;
      }
      console.log('loadedMetadata mp4', videoRef.current.duration);
      if(!isNaN(videoRef.current.duration)){
          videoRef.current.play();
      }
    }, [loadDateTime]);

    const reloadPlayer = React.useCallback(() => {
      console.log('ended')
      if(videoRef.current === null){
        return;
      }
      setLoadDateTime(Date.now());
      videoRef.current.load();
    }, []);

    React.useEffect(() => {
      if(videoRef.current === null){
        return;
      }
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      videoRef.current.addEventListener('ended', reloadPlayer)
      return () => {
        if(videoRef.current){
            videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
            videoRef.current.removeEventListener('ended', reloadPlayer)
        }
      }
    }, [handleLoadedMetadata, reloadPlayer]) 

  return (
      <CustomVideo ref={videoRef} src={url} crossOrigin="anonymous"></CustomVideo>
  )
}

export default React.memo(MP4Player);