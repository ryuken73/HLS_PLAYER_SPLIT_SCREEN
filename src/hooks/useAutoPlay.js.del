import React from "react";

const USE_CURRENT_PLAYER = true;
const CHANGE_PLAYER = false;
function useAutoPlay(props){
  const {autoPlay, autoInterval, maximizeGrid, autoPlayIndexRef} = props;
  React.useEffect(() => {
    console.log('!!!.currentchange:', autoPlay, autoPlayIndexRef.current , maximizeGrid)
    let timer;
    if(autoPlay){
      document.title=`CCTV[auto - every ${autoInterval}s]`
      const firstIndex = autoPlayIndexRef.current;
      maximizeGrid(firstIndex, USE_CURRENT_PLAYER);
      timer = setInterval(() => {
        const nextIndex = (autoPlayIndexRef.current + 1) % 9;
        maximizeGrid(nextIndex, CHANGE_PLAYER);
      },autoInterval*1000)
    } else {
      document.title="CCTV"
    }
    return () => {
      if(timer) clearInterval(timer);
    }
  },[autoInterval, autoPlay, autoPlayIndexRef, maximizeGrid ])
}

export default useAutoPlay;

