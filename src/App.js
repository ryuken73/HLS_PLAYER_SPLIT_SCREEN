import './App.css';
import React from 'react';
import GridVideos from './GridVideos';
import ModalBox from './ModalBox';
import HLSPlayer from './HLSPlayer';
import ConfigDialog from './ConfigDialog';
import Box from '@mui/material/Box';
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorage from './hooks/useLocalStorage';
import useAutoPlay from './hooks/useAutoPlay';
import SwiperControl from './SlderControl';
import "swiper/css";
 
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

const KEY_OPTIONS = 'hlsCCTVOptions';
const KEY_SELECT_SAVED = 'selectedSavedCCTVs';
const KEY_NOT_SELECT_SAVED = 'notSelectedSavedCCTVs';

const getRealIndex = (gridNum, gridDimension, realSelectedArray) => {
  const totalGridNum = gridDimension * gridDimension;
  const safeMaxIndex = Math.min(totalGridNum, realSelectedArray.length);
  return gridNum % safeMaxIndex;
}

function App() {
  const [savedOptions, saveOptions] = useLocalStorage(KEY_OPTIONS,{});
  const [selectedSaved, saveSelectedCCTVs] = useLocalStorage(KEY_SELECT_SAVED,[]);
  const [notSelectedSaved, saveNotSelectedCCTVs] = useLocalStorage(KEY_NOT_SELECT_SAVED,[]);
  const INITIAL_GRID_DIMENSION = savedOptions.gridDimension === undefined ? 2 : savedOptions.gridDimension;
  const INITIAL_AUTO_INTERVAL = savedOptions.autoInterval === undefined ? 10 : savedOptions.autoInterval;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalPlayer1, setModalPlayer1] = React.useState(null);
  const [modalPlayer2, setModalPlayer2] = React.useState(null);
  const [gridDimension, setGridDimension] = React.useState(INITIAL_GRID_DIMENSION);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [autoInterval, setAutoInterval] = React.useState(INITIAL_AUTO_INTERVAL);
  const [cctvsNotSelectedArray, setCCTVsNotSelectedArray] = React.useState(notSelectedSaved);
  const [cctvsSelectedArray, setCCTVsSelectedAray] = React.useState(selectedSaved);
  const [enableOverlayModal, setEnableOverlayModal] = React.useState(false);
  const [overlayContentModal, setOverContentlayModal] = React.useState('');
  const [enableOverlayGlobal, setEnableOverlayGlobal] = React.useState(true);
  const [checkedCCTVId, setCheckedCCTVId] = React.useState('');
  const [currentGridNum, setCurrentGridNum] = React.useState(null);
  const [playerChanged, setPlayerChanged] = React.useState(Date.now());
  const modalPlayerNumRef = React.useRef(0);

  useHotkeys('c', () => setDialogOpen(true));
  const autoPlayIndexRef = React.useRef(0);
  const preLoadMapRef = React.useRef(new Map());
  const setLeftSmallPlayerRef = React.useRef(()=>{});
  const gridNumNormalized = getRealIndex(currentGridNum, gridDimension, cctvsSelectedArray)

  const getNextPlayer = React.useCallback(() => {
    if(modalPlayerNumRef.current === 0){
      return [modalPlayer2, 1];
    } else {
      return [modalPlayer1, 0];
    }
  }, [modalPlayer1, modalPlayer2])

  const maximizeGrid = React.useCallback(gridNum => {
    const realIndex = getRealIndex(gridNum, gridDimension, cctvsSelectedArray)
    // const targetModalPlayerNum = realIndex % 2;
    const cctv = cctvsSelectedArray[realIndex];
    const cctvId = cctv.cctvId;
    const preloadMap = preLoadMapRef.current;
    const preloadElement = preloadMap.get(cctvId.toString());
    const [modalPlayer, nextModalPlayerNum]  = getNextPlayer();
    console.log('!!!', realIndex, cctvId, preloadMap, preloadElement, modalPlayer)
    mirrorModalPlayer(preloadElement, modalPlayer);
    setEnableOverlayModal(enableOverlayGlobal);
    setOverContentlayModal(cctv.title)
    setModalOpen(true);
    setCurrentGridNum(gridNum)
    setPlayerChanged(Date.now())
    modalPlayerNumRef.current = nextModalPlayerNum;
    autoPlayIndexRef.current = gridNum;
  },[gridDimension, cctvsSelectedArray, getNextPlayer, enableOverlayGlobal])

  useAutoPlay({autoPlay, autoInterval, maximizeGrid, autoPlayIndexRef});

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

  const setOptionsNSave = React.useCallback((key, value) => {
    key === 'gridDimension' && setGridDimension(value);
    key === 'autoInterval' && setAutoInterval(value);
    const options = {
      ...savedOptions,
      [key]: value
    }
    saveOptions(options)    
  },[saveOptions, savedOptions])

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
          <ModalBox 
            open={modalOpen} 
            currentGridNum={gridNumNormalized} 
            gridDimension={gridDimension}
            keepMounted={true} 
            autoPlay={autoPlay} 
            setOpen={setModalOpen} 
            contentWidth="80%" 
            contentHeight="auto"
          >
            <Swiper loop={true} speed={1000}>
              <SwiperControl playerChanged={playerChanged} />
              <SwiperSlide>
                <HLSPlayer 
                  fill={true}
                  responsive={true}
                  setPlayer={setModalPlayer1}
                  aspectRatio={"16:9"}
                  enableOverlay={enableOverlayModal}
                  overlayContent={overlayContentModal}
                  overlayBig={true}
                  overlayModal={true}
                ></HLSPlayer>
              </SwiperSlide>
              <SwiperSlide>
                <HLSPlayer 
                  fill={true}
                  responsive={true}
                  setPlayer={setModalPlayer2}
                  aspectRatio={"16:9"}
                  enableOverlay={enableOverlayModal}
                  overlayContent={overlayContentModal}
                  overlayBig={true}
                  overlayModal={true}
                ></HLSPlayer>
              </SwiperSlide>
            </Swiper>
          </ModalBox>
          <ConfigDialog 
            open={dialogOpen} 
            // cctvs={cctvs}
            cctvsNotSelected={cctvsNotSelectedArray}
            cctvsSelected={cctvsSelectedArray}
            setCCTVsSelectedAray={setCCTVsSelectedArrayNSave}
            setCCTVsNotSelectedArray={setCCTVsNotSelectedArrayNSave}
            setOptionsNSave={setOptionsNSave}
            gridDimension={gridDimension}
            autoInterval={autoInterval}
            setDialogOpen={setDialogOpen}
            checkedCCTVId={checkedCCTVId}
            setCheckedCCTVId={setCheckedCCTVId}
          ></ConfigDialog>
        </Box>
      </header>
    </div>
  );
}

export default App;
