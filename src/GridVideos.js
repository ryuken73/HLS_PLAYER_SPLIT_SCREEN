import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {AbsolutePositionBox, TransparentPaper} from './template/basicComponents';
import HLSPlayer from './HLSPlayer';
import MP4Player from './MP4Player';
import Box from '@mui/material/Box';
import styled from 'styled-components';

const Container = styled.div`
    height: 100%;
    display: grid;
    grid-template-columns: ${props => `repeat(${props.dimension}, 1fr)`};
    grid-template-rows: ${props => `repeat(${props.dimension}, 1fr)`};
    align-items: stretch;
`

const GridVideos = props => {
    const {
        preLoadMapRef=null,
        cctvsSelected=[],
        setPlayer,
        toggleAutoPlay,
        autoPlay,
        gridDimension=2,
        enableOverlayGlobal,
        toggleOverlayGlobal,
    } = props;

    // const cctvs = [...cctvsInAreas.values()].flat();

    console.log('#', cctvsSelected, enableOverlayGlobal)

    const mp4RegExp = /.*\.mp4.*/;

    const addToPreloadMap = element => {
        if(element === null) return;
        const cctvId = element.id;
        const preloadMap = preLoadMapRef.current;
        preloadMap.set(cctvId, element);
    }

    useHotkeys('a', () => toggleAutoPlay(), [toggleAutoPlay])
    useHotkeys('t', () => toggleOverlayGlobal(), [toggleOverlayGlobal])

    return (
        <Container dimension={gridDimension}>
            {cctvsSelected.map((cctv,cctvIndex) => (
                <Box key={cctv.cctvId} id={cctv.cctvId} ref={addToPreloadMap} overflow="hidden" minWidth="60px" height="100%">
                    <div style={{height: "100%", boxSizing: "border-box", padding:"1px", borderColor:"black", border:"solid 1px black", background:`${autoPlay ? "maroon":"white"}`}}>
                    {mp4RegExp.test(cctv.url) ? (
                        <MP4Player source={cctv}></MP4Player>
                    ):(
                        <HLSPlayer 
                            width={350}
                            height={200}
                            fluid={false}
                            aspectRatio=""
                            fill={true}
                            source={cctv}
                            setPlayer={setPlayer}
                            enableOverlay={enableOverlayGlobal}
                            overlayBig={true}
                            overlayContent={cctv.title}
                        ></HLSPlayer>
                    )}
                    </div>
                </Box>
            ))}
      </Container>
    )
}

export default React.memo(GridVideos);
