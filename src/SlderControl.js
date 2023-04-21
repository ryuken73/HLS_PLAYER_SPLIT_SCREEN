import React from 'react';
import styled from 'styled-components';
import { useSwiper } from 'swiper/react';

const NoComponent = styled.div`
  display: none;
`

function SlderControl(props) {
  const {playerChanged} = props;
  const swiper = useSwiper();
  React.useEffect(() => {
    swiper.slideNext();
  }, [swiper, playerChanged])
  return (<NoComponent />)
}

export default React.memo(SlderControl);