import React from "react";

function useAutoPlay(props){
  const {autoPlay, autoInterval, maximizeGrid, autoPlayIndexRef} = props;
  React.useEffect(() => {
    let timer;
    if(autoPlay){
      document.title=`CCTV[auto - every ${autoInterval}s]`
      const firstIndex = autoPlayIndexRef.current;
      maximizeGrid(firstIndex);
      timer = setInterval(() => {
        const nextIndex = (autoPlayIndexRef.current + 1) % 9;
        maximizeGrid(nextIndex);
      },autoInterval*1000)
    } else {
      document.title="CCTV"
    }
    return () => {
      if(timer) clearInterval(timer);
    }
  },[autoInterval, autoPlay, autoPlayIndexRef, maximizeGrid])
}

export default useAutoPlay;

