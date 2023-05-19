import './App.css';
import React from 'react';
import GridVideos from './GridVideos';
import ModalBox from './ModalBox';
import HLSPlayer from './HLSPlayer';
import ConfigDialog from './ConfigDialog';
import Box from '@mui/material/Box';
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from 'swiper';
// Import Swiper styles
import { useHotkeys } from 'react-hotkeys-hook';
import useLocalStorage from './hooks/useLocalStorage';
import useAutoPlay from './hooks/useAutoPlay';
import SwiperControl from './SwiperControl';
import { getRealIndex, mirrorModalPlayer } from './lib/sourceUtil';
import "swiper/css";
 
const KEY_OPTIONS = 'hlsCCTVOptions';
const KEY_SELECT_SAVED = 'selectedSavedCCTVs';
const KEY_NOT_SELECT_SAVED = 'notSelectedSavedCCTVs';

function App() {
  const [savedOptions, saveOptions] = useLocalStorage(KEY_OPTIONS,{});
  const [selectedSaved, saveSelectedCCTVs] = useLocalStorage(KEY_SELECT_SAVED,[]);
  const [notSelectedSaved, saveNotSelectedCCTVs] = useLocalStorage(KEY_NOT_SELECT_SAVED,[]);
  const INITIAL_GRID_DIMENSION = savedOptions.gridDimension === undefined ? 2 : savedOptions.gridDimension;
  const INITIAL_AUTO_INTERVAL = savedOptions.autoInterval === undefined ? 10 : savedOptions.autoInterval;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalPlayer0, setModalPlayer0] = React.useState(null);
  const [modalPlayer1, setModalPlayer1] = React.useState(null);
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
      modalPlayerNumRef.current = 1;
      return modalPlayer1;
    } else {
      modalPlayerNumRef.current = 0;
      return modalPlayer0;
    }
  }, [modalPlayer0, modalPlayer1])

  const maximizeGrid = React.useCallback((gridNum) => {
    const realIndex = getRealIndex(gridNum, gridDimension, cctvsSelectedArray)
    // const targetModalPlayerNum = realIndex % 2;
    const cctv = cctvsSelectedArray[realIndex];
    const cctvId = cctv.cctvId;
    const preloadMap = preLoadMapRef.current;
    const preloadElement = preloadMap.get(cctvId.toString());
    const modalPlayer  = getNextPlayer();
    console.log('!!!', realIndex, cctvId, preloadMap, preloadElement, modalPlayer);
    mirrorModalPlayer(preloadElement, modalPlayer);
    setEnableOverlayModal(enableOverlayGlobal);
    setOverContentlayModal(cctv.title)
    setCurrentGridNum(gridNum)
    if(modalOpen){
      setPlayerChanged(Date.now())
    }
    setModalOpen(true);
    // modalPlayerNumRef.current = nextModalPlayerNum;
    autoPlayIndexRef.current = gridNum;
  },[modalOpen, gridDimension, cctvsSelectedArray, getNextPlayer, enableOverlayGlobal])

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
            <Swiper 
              loop={true} 
              speed={1000}
              // effect="fade"
              // modules={[EffectFade]}
            >
              <SwiperControl 
                maximizeGrid={maximizeGrid}
                playerChanged={playerChanged} 
              />
              <SwiperSlide>
                <HLSPlayer 
                  fill={true}
                  responsive={true}
                  setPlayer={setModalPlayer0}
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
                  setPlayer={setModalPlayer1}
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
