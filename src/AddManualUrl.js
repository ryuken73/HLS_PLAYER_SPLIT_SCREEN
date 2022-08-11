import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    /* margin-left: 15px; */
    padding: 20px;
    height: 50px;

`;

function AddManualUrl() {
  return (
    <Container>
        <div>Add New Url!</div>
        <label>Title</label>
        <input type="text"></input>
        <label>Url</label>
        <input type="text"></input>
    </Container>
  )
}

export default React.memo(AddManualUrl);
