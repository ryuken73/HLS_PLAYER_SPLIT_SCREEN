import React from 'react';
import { useSwiper } from 'swiper/react';

function SliderControl(props) {
  const {swiperRef, children} = props;
  const swiper = useSwiper();
  swiperRef.current = swiper;
  return (
    <div>{children}</div>
  )
}

export default React.memo(SliderControl);