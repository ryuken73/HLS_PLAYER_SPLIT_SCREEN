import React from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSwiper } from 'swiper/react';

function SlderControl(props) {
  const {playerChanged, children, maximizeGrid} = props;
  const swiper = useSwiper();
  const safeSlide = React.useCallback((indexNumber) => {
    if(swiper.animating){
      return;
    }
    maximizeGrid(indexNumber)
  }, [maximizeGrid, swiper.animating])
  useHotkeys('1', () => safeSlide('0'), [maximizeGrid])
  useHotkeys('2', () => safeSlide('1'), [maximizeGrid])
  useHotkeys('3', () => safeSlide('2'), [maximizeGrid])
  useHotkeys('4', () => safeSlide('3'), [maximizeGrid])
  useHotkeys('5', () => safeSlide('4'), [maximizeGrid])
  useHotkeys('6', () => safeSlide('5'), [maximizeGrid])
  useHotkeys('7', () => safeSlide('6'), [maximizeGrid])
  useHotkeys('8', () => safeSlide('7'), [maximizeGrid])
  useHotkeys('9', () => safeSlide('8'), [maximizeGrid])

  React.useEffect(() => {
    swiper.slideNext();
  }, [swiper, playerChanged])
  return (
    <div>{children}</div>
  )
}

export default React.memo(SlderControl);