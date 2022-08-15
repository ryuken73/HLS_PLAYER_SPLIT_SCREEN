import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import styled from 'styled-components';
import HLSPlayer from './HLSPlayer';
import {replace} from './lib/arrayUtil';

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
  const {
    allCCTVs, 
    checkedCCTVId, 
    checkedInSelected, 
    setCCTVsNotSelectedArray, 
    setCCTVsSelectedArray
  } = props;
  const [url, setUrl] = React.useState('');
  const [title, setTitle] = React.useState('');
  // const titleRef = React.useRef('');

  React.useEffect(() => {
    if(checkedCCTVId){
      const checkedCCTV = allCCTVs.find(cctv => cctv.cctvId === checkedCCTVId);
      if(checkedCCTV){
        setUrl(checkedCCTV.url || 'https://localhost');
        setTitle(checkedCCTV.title || '');
      }
    } else {
      setUrl('https://-');
      setTitle('');
    }
  },[allCCTVs, checkedCCTVId])

  const setPlayer = React.useCallback(() => {
    return null;
  },[])

  const onChangeUrl = React.useCallback((event) => {
    setUrl(event.target.value);
  },[])

  const source = React.useMemo(() => {
    return {
      url
    }
  },[url])

  const setTitleValue = React.useCallback((event) => {
    setTitle(event.target.value);
  },[])

  const onClickAdd = React.useCallback(() => {
    if(checkedCCTVId){
      if(checkedInSelected){
        setCCTVsSelectedArray(cctvs => {
          const targetIndex = cctvs.findIndex(cctv => cctv.cctvId === checkedCCTVId);
          return replace(cctvs).index(targetIndex).value({
            ...cctvs[targetIndex],
            url,
            title
          })
        })
        return;
      } else {
        setCCTVsNotSelectedArray(cctvs => {
          const targetIndex = cctvs.findIndex(cctv => cctv.cctvId === checkedCCTVId);
          return replace(cctvs).index(targetIndex).value({
            ...cctvs[targetIndex],
            url,
            title
          })
        })
        return;
      }
    }
    const ALREADY_INDEX = allCCTVs.findIndex(cctv => cctv.url === url);
    if(ALREADY_INDEX >= 0){
      const alreadyCCTV = allCCTVs[ALREADY_INDEX];
      alert(`URL already exists! - [${alreadyCCTV.title}]`);
      return;
    }
    const newCCTV = {
      url,
      title,
      cctvId: Date.now(),
      num: Date.now()
    } 
    setCCTVsNotSelectedArray(cctvs => {
      return [...cctvs, newCCTV]
    })
  },[checkedCCTVId, allCCTVs, url, title, setCCTVsNotSelectedArray, checkedInSelected, setCCTVsSelectedArray])

  return (
    <Container>
        <Box width="300px">
          <HLSPlayer 
            source={source}
            aspectRatio="16:9"
            fill={true}
            enableOverlay={false}
            setPlayer={setPlayer}
          ></HLSPlayer>
        </Box>
        <SubContainer>
          <TextField onChange={setTitleValue} value={title} label="Title" variant="outlined" size="small"></TextField>
          <TextField fullWidth onChange={onChangeUrl} value={url} label="Url" variant="outlined" size="small"></TextField>
          <Button onClick={onClickAdd}>{checkedCCTVId ? "Update":"Add"}</Button>
        </SubContainer>
    </Container>
  )
}

export default React.memo(AddManualUrl);
