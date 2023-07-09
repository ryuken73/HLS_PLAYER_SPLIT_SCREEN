import React from 'react';
import styled from 'styled-components';

const Container = styled.div``

function Overlay(props) {
  const {title} = props;
  return (
    <Container>
      {title}
    </Container>
  )
}

export default React.memo(Overlay)