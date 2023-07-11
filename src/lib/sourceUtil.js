import config from '../config';
const {YOUTUBE_HLS_URL_GET_API} = config;


export const setUniqAreasFromSources = (cctvs, setFunction) => {
    const areasOnly = cctvs.map(cctv => {
        return cctv.title.split(' ')[0]
    })
    const uniqAreas = [...new Set(areasOnly)];
    setFunction && setFunction(uniqAreas);
    return uniqAreas;
}
      
export const groupCCTVsByArea = (uniqAreas, cctvs, setFunction) => {
    const grouped = new Map();
    uniqAreas.forEach(area => {
        const cctvsInArea = cctvs.filter(cctv => {
        return cctv.title.startsWith(area);
        })
        grouped.set(area, cctvsInArea);
    })
    setFunction && setFunction(grouped);
    return grouped;
}

export const orderByArea = cctvs => {
    const uniqAreas = setUniqAreasFromSources(cctvs);
    const orderedByAreaMap = groupCCTVsByArea(uniqAreas, cctvs);
    return [...orderedByAreaMap.values()].flat();
}  

export const mirrorModalPlayer = (playerNode, modalPlayer) => {
  try {
    const videoElement =  playerNode.querySelector('video');
    console.log('### videoElement:', videoElement, modalPlayer);
    // console.log('2-1s. start captureStream')
    const mediaStream = videoElement.captureStream();
    const modalVideoPlayer = modalPlayer.tech().el();
    modalVideoPlayer.srcObject = null;
    modalVideoPlayer.srcObject = mediaStream;
    // console.log('2-1e. start-end set srcObject(captured stream)')
    return true;
  } catch (err) {
    // console.log('2-1e. start-err captureStream:', err)
    console.error(err);
    return false;
  }
}

const stopStream = stream => {
  try {
    console.log('stopStream:', stream);
    stream.getTracks().forEach((track) => track.stop());
    return true
  } catch(err) {
    console.error('error stopStream:', err);
    return false;
  }
}

export const mirrorModalPlayerMP4 = (playerNode, modalPlayer, mediaStreamRef) => {
  try {
    const videoElement =  playerNode.querySelector('video');
    console.log('### videoElement:', videoElement, modalPlayer);
    // console.log('2-1s. start captureStream')
    mediaStreamRef.current = null;
    // stopStream(mediaStreamRef.current);
    const mediaStream = videoElement.captureStream();
    const modalVideoPlayer = modalPlayer;
    modalVideoPlayer.srcObject = null;
    modalVideoPlayer.srcObject = mediaStream;
    mediaStreamRef.current = mediaStream;
    // console.log('2-1e. start-end set srcObject(captured stream)')
    return true;
  } catch (err) {
    // console.log('2-1e. start-err captureStream:', err)
    console.error(err);
    return false;
  }
}

export const getRealIndex = (cctvIndex, gridDimension, realSelectedArray) => {
  const totalGridNum = gridDimension * gridDimension;
  const safeMaxIndex = Math.min(totalGridNum, realSelectedArray.length);
  return cctvIndex % safeMaxIndex;
}

export const getYoutubePlaylistUrl = videoId => {
    return new Promise((resolve, reject) => {
        fetch(`${YOUTUBE_HLS_URL_GET_API}/${videoId}`)
        .then(response => response.json())
        .then(result => {
            if(result.success){
                resolve(result.result)
            } else {
                throw new Error(result.error)
            }
        })
        .catch(err => {
            reject(err);
            alert('Check Youtube Url!. It can be changed!')
        })
    })
}

export const isPlayerPlaying = (player) => {
    try {
        const ended = typeof(player.ended) === 'function' ? player.ended() : player.ended;
        const paused = typeof(player.paused) === 'function' ? player.paused() : player.paused;
        const currentTime = typeof(player.currentTime) === 'function' ? player.currentTime() : player.currentTime;
        const readyState = typeof(player.readyState) === 'function' ? player.readyState() : player.readyState;
        console.log('getNon currentTime:', currentTime)
        console.log('getNon paused:', paused)
        console.log('getNon ended:', ended)
        console.log('getNon readyState:', readyState);
        return (
            currentTime > 0 &&
            !paused &&
            !ended &&
            readyState > 2
        );
    } catch (err) {
        console.error("errors in isPlayerPlaying:", err);
        console.error("return false to continue");
        return false;
    }
};

export const getNonPausedPlayerIndex = (nextPlayerIndex, cctvPlayersRef, reloadPlayerComponent=()=>{}) => {
    let nextIndex = nextPlayerIndex;
    console.log('1.getNonPausedPlayerIndex: nextIndex=', nextIndex);
    let loopCount = 0;
    while(true){
        console.log('2.getNonPausedPlayerIndex(first in while):', nextIndex, cctvPlayersRef.current[nextIndex])
        const player = cctvPlayersRef.current[nextIndex];
        if(player === undefined){
            console.log('x.!getNonPausedPlayerIndex player is undefined');
            reloadPlayerComponent(nextIndex)
            nextIndex = (nextIndex + 1) % cctvPlayersRef.current.length;
            continue;
        }
        // const paused = typeof(player.paused) === 'boolean' ? player.paused :player.paused();
        const paused = !isPlayerPlaying(cctvPlayersRef.current[nextIndex]);
        console.log('2-X.getNonPausedPlayerIndex paused:', paused);
        // console.log('2-1.getNonPausedPlayerIndex isPlaying:', isPlaying);
        if(!paused){
        // if(isPlaying){
            break;
        }
        reloadPlayerComponent(nextIndex)
        console.log('3.!getNonPausedPlayerIndex paused Index:', nextIndex)
        nextIndex = (nextIndex + 1) % cctvPlayersRef.current.length;
        loopCount++;
        if(nextIndex === nextPlayerIndex || loopCount === cctvPlayersRef.current.length) {
            console.error('3-X prevent endless loop. loopCount=',loopCount);
            break;
        }
    }
    console.log('4.getNonPausedPlayerIndex return nextIndex:', nextIndex)
    return nextIndex;
}

export const getYoutubeId = url => {
    const addr = new URL(url);
    return addr.searchParams.get('v');
}
    
