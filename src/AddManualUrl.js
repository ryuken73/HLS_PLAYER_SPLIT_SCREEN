import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';
import HLSPlayer from './HLSPlayer';

const Container = styled.div`
  /* margin-left: 15px; */
  display: flex;
  padding: 20px;
  /* height: 50px; */
`;
const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 300px);
  padding: 10px;
  padding-top: 0px;
  justify-content: space-between;
`;


function AddManualUrl(props) {
  const {allCCTVs, setCCTVsNotSelectedArray} = props;
  const [url, setUrl] = React.useState('');
  const titleRef = React.useRef('');
  const onChangeUrl = React.useCallback((event) => {
    setUrl(event.target.value);
  },[])
  const source = React.useMemo(() => {
    return {
      url
    }
  },[url])
  const setTitleValue = React.useCallback((event) => {
    titleRef.current = event.target.value;
  },[titleRef])
  const onClickAdd = React.useCallback(() => {
    const ALREADY_INDEX = allCCTVs.findIndex(cctv => cctv.url === url);
    if(ALREADY_INDEX >= 0){
      const alreadyCCTV = allCCTVs[ALREADY_INDEX];
      alert(`Url already exists! - [${alreadyCCTV.title}]`);
      return;
    }
    const newCCTV = {
      url,
      title: titleRef.current,
      cctvId: Date.now(),
      num: Date.now()
    } 
    setCCTVsNotSelectedArray(cctvs => {
      return [...cctvs, newCCTV]
    })
    
  },[allCCTVs, url, setCCTVsNotSelectedArray])
  return (
    <Container>
        <Box width="300px">
          <HLSPlayer 
            source={source}
            aspectRatio="16:9"
            fill={true}
            enableOverlay={false}
            setPlayer={()=>{}}
          ></HLSPlayer>
        </Box>
        <SubContainer>
          <TextField onBlur={setTitleValue} label="Title" variant="outlined" size="small"></TextField>
          <TextField fullWidth onChange={onChangeUrl} value={url} label="Url" variant="outlined" size="small"></TextField>
          <Button onClick={onClickAdd}>add</Button>
        </SubContainer>
    </Container>
  )
}

export default React.memo(AddManualUrl);
