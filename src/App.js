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
// import useAutoPlay from './hooks/useAutoPlay';
import SwiperControl from './SwiperControl';
import { getRealIndex, mirrorModalPlayer, getNonPausedPlayerIndex } from './lib/sourceUtil';
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
  const [modalPlayers, setModalPlayers] = React.useState([null, null])
  const [gridDimension, setGridDimension] = React.useState(INITIAL_GRID_DIMENSION);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [autoInterval, setAutoInterval] = React.useState(INITIAL_AUTO_INTERVAL);
  const [cctvsNotSelectedArray, setCCTVsNotSelectedArray] = React.useState(notSelectedSaved);
  const [cctvsSelectedArray, setCCTVsSelectedAray] = React.useState(selectedSaved);
  const [enableOverlayModal, setEnableOverlayModal] = React.useState(false);
  const [overlayContentModal, setOverContentlayModal] = React.useState('');
  const [enableOverlayGlobal, setEnableOverlayGlobal] = React.useState(true);
  const [checkedCCTVId, setCheckedCCTVId] = React.useState('');
  const [currentCCTVIndex, setCurrentCCTVIndex] = React.useState(null);
  const [swiper, setSwiper] = React.useState(null);
  const modalPlayerNumRef = React.useRef(0);

  useHotkeys('c', () => setDialogOpen(true));
  const cctvIndexRef = React.useRef(0);
  const preLoadMapRef = React.useRef(new Map());
  const setLeftSmallPlayerRef = React.useRef(()=>{});
  const autoplayTimer = React.useRef(null);
  const modalOpenRef = React.useRef(modalOpen);
  const gridNumNormalized = getRealIndex(currentCCTVIndex, gridDimension, cctvsSelectedArray)
  const cctvPlayersRef = React.useRef([]);

  console.log('gridNumNormalized=', gridNumNormalized, currentCCTVIndex, cctvIndexRef.current)

  const getNextPlayer = React.useCallback(() => {
    const modalOpen = modalOpenRef.current;
    let nextNum;
    if(!modalOpen){
      nextNum = 0;
    } else {
      nextNum = (modalPlayerNumRef.current + 1) % 2;
    }
    console.log('!!! nextNum for player =', nextNum);
    modalPlayerNumRef.current=nextNum;
    return modalPlayers[nextNum]
  }, [modalPlayers])

  const initModalPlayersIndex = React.useCallback(index => {
    return (cctvIndex, player) => {
      console.log('^^^^', index, player)
      setModalPlayers(players => {
        const newPlayers = [...players];
        newPlayers[index] = player;
        console.log('!!!', newPlayers)
        return newPlayers
      })
    }
  }, []);

  const getSourceElement = React.useCallback((cctvIndex) => {
    // const realIndex = getRealIndex(cctvIndex, gridDimension, cctvsSelectedArray)
    console.log(cctvIndex)
    const cctv = cctvsSelectedArray[cctvIndex];
    const cctvId = cctv.cctvId;
    const preloadMap = preLoadMapRef.current;
    const preloadElement = preloadMap.get(cctvId.toString());
    return [cctv, preloadElement];
  }, [cctvsSelectedArray])

  const gridNum2CCTVIndex = React.useCallback((gridNum) => {
    return getRealIndex(gridNum, gridDimension, cctvsSelectedArray)
  }, [cctvsSelectedArray, gridDimension])

  const maximizeGrid = React.useCallback((cctvIndex) => {
    const [cctv, preloadElement] = getSourceElement(cctvIndex);
    const modalPlayer = getNextPlayer();
    console.log('!!!', modalOpenRef.current, preloadElement, modalPlayer);
    const ret = mirrorModalPlayer(preloadElement, modalPlayer);
    if(!ret) return false;
    setEnableOverlayModal(enableOverlayGlobal);
    setOverContentlayModal(cctv.title)
    setCurrentCCTVIndex(cctvIndex)
    // setModalOpen(true);
    // modalOpenRef.current = true;
    cctvIndexRef.current = cctvIndex;
    return true;
  },[getSourceElement, getNextPlayer, enableOverlayGlobal])

  const safeSlide = React.useCallback((targetIndex) => {
    const {gridNum, cctvIndex} = targetIndex;
    const targetCCTVIndex = cctvIndex === undefined ? gridNum2CCTVIndex(gridNum) : cctvIndex;
    const modalOpen = modalOpenRef.current;
    if(swiper.animating){
      return;
    }
    const ret = maximizeGrid(targetCCTVIndex);
    if(!ret) return false;
    if(modalOpen){
      console.log('!!! slide next!')
      swiper.slideNext();
    } else {
      console.log('!!! slide to 0')
      // swiper.slideTo(0);
      swiper.slideToLoop(0);
      setModalOpen(true);
      modalOpenRef.current = true;
    }
    console.log('!!!!current modalOpen = ', modalOpen, swiper.activeIndex, swiper.realIndex)
    return true;
  }, [gridNum2CCTVIndex, maximizeGrid, swiper])

  useHotkeys('1', () => safeSlide({gridNum: '0'}), [safeSlide])
  useHotkeys('2', () => safeSlide({gridNum: '1'}), [safeSlide])
  useHotkeys('3', () => safeSlide({gridNum: '2'}), [safeSlide])
  useHotkeys('4', () => safeSlide({gridNum: '3'}), [safeSlide])
  useHotkeys('5', () => safeSlide({gridNum: '4'}), [safeSlide])
  useHotkeys('6', () => safeSlide({gridNum: '5'}), [safeSlide])
  useHotkeys('7', () => safeSlide({gridNum: '6'}), [safeSlide])
  useHotkeys('8', () => safeSlide({gridNum: '7'}), [safeSlide])
  useHotkeys('9', () => safeSlide({gridNum: '8'}), [safeSlide])
  // useAutoPlay({autoPlay, autoInterval, maximizeGrid, cctvIndexRef});

  const runAutoPlay = React.useCallback((startAutoPlay=false, autoInterval) => {
    if(startAutoPlay){
      document.title=`CCTV[auto - every ${autoInterval}s]`
      let firstIndex = cctvIndexRef.current;
      // maximizeGrid(firstIndex);
      safeSlide({cctvIndex: firstIndex});
      autoplayTimer.current = setInterval(() => {
        // const nextIndex = (cctvIndexRef.current + 1) % 9;
        const nextPlayerIndex = (cctvIndexRef.current + 1) % (cctvPlayersRef.current.length);
        const nextIndex = getNonPausedPlayerIndex(nextPlayerIndex, cctvPlayersRef);

        // console.log('!!! nextIndex=', nextIndex, cctvPlayersRef.current[nextIndex].paused())
        const ret = safeSlide({gridNum: nextIndex});
        // maximizeGrid(nextIndex);
        // swiper.slideNext();
      },autoInterval*1000)
    } else {
      document.title="CCTV"
      clearInterval(autoplayTimer.current);
    }
  }, [safeSlide, cctvPlayersRef])

  const toggleAutoPlay = React.useCallback(() => {
    setAutoPlay(autoPlay => {
      if(autoPlay){
        runAutoPlay(false);
      } else {
        runAutoPlay(true, autoInterval);
      }
      return !autoPlay;
    })
  },[autoInterval, runAutoPlay])

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
            toggleAutoPlay={toggleAutoPlay}
            autoPlay={autoPlay}
            gridDimension={gridDimension}
            enableOverlayGlobal={enableOverlayGlobal}
            toggleOverlayGlobal={toggleOverlayGlobal}
            currentActiveIndex={gridNumNormalized}
            cctvPlayersRef={cctvPlayersRef}
          ></GridVideos>
          <ModalBox 
            open={modalOpen} 
            modalOpenRef={modalOpenRef}
            currentCCTVIndex={gridNumNormalized} 
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
                setSwiper={setSwiper}
              />
              {modalPlayers.map((player, index) => (
                <SwiperSlide key={index}>
                  <HLSPlayer 
                    fill={true}
                    responsive={true}
                    setPlayer={initModalPlayersIndex(index)}
                    aspectRatio={"16:9"}
                    enableOverlay={enableOverlayModal}
                    overlayContent={overlayContentModal}
                    overlayBig={true}
                    overlayModal={true}
                    playerNum={index}
                    autoRefresh={false}
                  ></HLSPlayer>
                </SwiperSlide>
              ))}
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
