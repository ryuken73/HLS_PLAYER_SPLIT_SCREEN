import React from 'react';
import { useSwiper } from 'swiper/react';

function SlderControl(props) {
  const {setSwiper, children} = props;
  const swiper = useSwiper();
  setSwiper(swiper);
  return (
    <div>{children}</div>
  )
}

export default React.memo(SlderControl);