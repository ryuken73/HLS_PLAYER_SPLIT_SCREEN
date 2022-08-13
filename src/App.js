import './App.css';
import React from 'react';
import GridVideos from './GridVideos';
import ModalBox from './ModalBox';
import HLSPlayer from './HLSPlayer';
import ConfigDialog from './ConfigDialog';
import Box from '@mui/material/Box';
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorage from './hooks/useLocalStorage';
 
const mirrorModalPlayer = (playerNode, modalPlayer) => {
  const videoElement =  playerNode.querySelector('video');
  console.log('### videoElement:', videoElement, modalPlayer);
  const mediaStream = videoElement.captureStream();
  const modalVideoPlayer = modalPlayer.tech().el();
  modalVideoPlayer.srcObject = null;
  modalVideoPlayer.srcObject = mediaStream;
}

const cctvs = [
    {num:1,cctvId:9965,url:"https://topiscctv1.eseoul.go.kr/sd1/ch20.stream/playlist.m3u8",title:"서울 마포구 성산교",lat:37.56269,lng:126.899925, mapLevel:8},
    {num:2,cctvId:9966,url:"https://topiscctv1.eseoul.go.kr/sd1/ch141.stream/playlist.m3u8",title:"서울 노원구 중랑천",lat:37.63238,lng:127.0626972, mapLevel:8},
    {num:3,cctvId:9967,url:"https://topiscctv1.eseoul.go.kr/sd1/ch142.stream/playlist.m3u8",title:"부산 동래구 세병교(온천천)",lat:35.19768,lng:129.0825083, mapLevel:10},
    {num:5,cctvId:9969,url:"http://cctvsec.ktict.co.kr:8081/openapix004/2413/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OC8xMi8yMDIyIDI6NDA6NDAgUE0maGFzaF92YWx1ZT1JYmozVkltc3V4a2RRQm5qREdObHpBPT0mdmFsaWRtaW51dGVzPTE1NjAmaWQ9NGU3YjFhOGVmZGNhNDZlMmEwYTJhZTY2NWRlMzE3MjMtMTY2MDMxODg0MDY3MS0yNDEzJmNoZWNraXA9dHJ1ZQ==",title:"대구 동구 신천",lat:35.87561,lng:128.6097306},
    {num:6,cctvId:9970,title:"대전 유성구 갑천",lat:36.37241,lng:127.37385},
    {num:17,cctvId:9981,title:"인천 중구 연안부두",lat:37.45414,lng:126.5986194, mapLevel:10},
    {num:8,cctvId:9972,title:"경기도 가평군 가평2교(북한강)",lat:37.83101,lng:127.5228861},
    {num:22,cctvId:9986,title:"강원도 속초시 등대전망대",lat:38.21339,lng:128.6001},
    {num:4,cctvId:9968,title:"충북 청주시 무심천",lat:36.63583,lng:127.4822722},
    {num:12,cctvId:9976,title:"충남 공주시 금강",lat:36.47092,lng:127.1263889},
]

function App() {
  const [savedOptions, saveOptions] = useLocalStorage('cctvOptions',{});
  const [selectedSaved, saveSelectedCCTVs] = useLocalStorage('selectedSavedCCTVs',[]);
  const [notSelectedSaved, saveNotSelectedCCTVs] = useLocalStorage('notSelectedSavedCCTVs',[]);
  const INITIAL_DISPLAY_GRID = savedOptions.displayGrid === undefined ? false : savedOptions.displayGrid;
  const INITIAL_GRID_DIMENSION = savedOptions.gridDimension === undefined ? 2 : savedOptions.gridDimension;
  const INITIAL_AUTO_INTERVAL = savedOptions.autoInterval === undefined ? 2 : savedOptions.autoInterval;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalPlayer, setModalPlayer] = React.useState(null);
  const [gridDimension, setGridDimension] = React.useState(INITIAL_GRID_DIMENSION);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [cctvsNotSelectedArray, setCCTVsNotSelectedArray] = React.useState(notSelectedSaved);
  const [cctvsSelectedArray, setCCTVsSelectedAray] = React.useState(selectedSaved);
  const [enableOverlayModal, setEnableOverlayModal] = React.useState(false);
  const [overlayContentModal, setOverContentlayModal] = React.useState('');
  const [enableOverlayGlobal, setEnableOverlayGlobal] = React.useState(true);

  useHotkeys('c', () => setDialogOpen(true));
  const autoPlayIndexRef = React.useRef(0);
  const preLoadMapRef = React.useRef(new Map());
  const setLeftSmallPlayerRef = React.useRef(()=>{});

  const maximizeGrid = React.useCallback(gridNum => {
    const totalGridNum = gridDimension * gridDimension;
    const safeMaxIndex = Math.min(totalGridNum, cctvsSelectedArray.length);
    console.log('maximizeGrid gridNum=', gridNum);
    const cctv = cctvsSelectedArray[gridNum % safeMaxIndex];
    const cctvId = cctv.cctvId;
    const preloadMap = preLoadMapRef.current;
    const preloadElement = preloadMap.get(cctvId.toString());
    console.log(cctvId, preloadMap, preloadElement)
    mirrorModalPlayer(preloadElement, modalPlayer);
    // setEnableOverlayModal(true);
    setEnableOverlayModal(enableOverlayGlobal);
    setOverContentlayModal(cctv.title)
    setModalOpen(true);
    autoPlayIndexRef.current = gridNum;
  },[modalPlayer, gridDimension, cctvsSelectedArray, enableOverlayGlobal])

  const toggleAutoPlay = React.useCallback(() => {
    setAutoPlay(autoPlay => {
      return !autoPlay;
    })
  },[setAutoPlay])

  const toggleOverlayGlobal = React.useCallback(() => {
    if(modalOpen) {
      return;
    }
    setEnableOverlayGlobal(global => {
      return !global;
    })
  },[modalOpen, setEnableOverlayGlobal])

  const setCCTVsSelectedArrayNSave = React.useCallback((cctvsArray) =>{
    setCCTVsSelectedAray(cctvsArray);
    saveSelectedCCTVs(cctvsArray);
  },[saveSelectedCCTVs])

  const setCCTVsNotSelectedArrayNSave = React.useCallback((cctvsArray) => {
    setCCTVsNotSelectedArray(cctvsArray);
    saveNotSelectedCCTVs(cctvsArray);
  },[saveNotSelectedCCTVs])

  return (
    <div className="App">
      <header className="App-header">
        <Box width="100%" height="100%">
          <GridVideos
            setPlayer={setLeftSmallPlayerRef.current}
            cctvsSelected={cctvsSelectedArray}
            preLoadMapRef={preLoadMapRef}
            maximizeGrid={maximizeGrid}
            toggleAutoPlay={toggleAutoPlay}
            autoPlay={autoPlay}
            gridDimension={gridDimension}
            enableOverlayGlobal={enableOverlayGlobal}
            toggleOverlayGlobal={toggleOverlayGlobal}
          ></GridVideos>
          <ModalBox open={modalOpen} keepMounted={true} autoPlay={autoPlay} setOpen={setModalOpen} contentWidth="80%" contentHeight="auto">
            <HLSPlayer 
              fill={true}
              responsive={true}
              setPlayer={setModalPlayer}
              aspectRatio={"16:9"}
              enableOverlay={enableOverlayModal}
              overlayContent={overlayContentModal}
              overlayBig={true}
              overlayModal={true}
            ></HLSPlayer>
          </ModalBox>
          <ConfigDialog 
            open={dialogOpen} 
            // cctvs={cctvs}
            cctvsNotSelected={cctvsNotSelectedArray}
            cctvsSelected={cctvsSelectedArray}
            setCCTVsSelectedAray={setCCTVsSelectedArrayNSave}
            setCCTVsNotSelectedArray={setCCTVsNotSelectedArrayNSave}
            setDialogOpen={setDialogOpen}
          ></ConfigDialog>
        </Box>
      </header>
    </div>
  );
}

export default App;
