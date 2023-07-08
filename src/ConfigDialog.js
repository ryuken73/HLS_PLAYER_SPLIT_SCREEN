import React from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import FormGroup from '@mui/material/FormGroup';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import styled from 'styled-components';
import Column from './Column';
import AddManualUrl from './AddManualUrl';
import { DragDropContext } from 'react-beautiful-dnd';
import {moveTo, remove, add} from './lib/arrayUtil';

const scroll = 'paper';
const columnNames =  ['dragFrom', 'dropOn'];
const Row = styled.div`
    display: flex;
    align-items: center;
    font-size: 15px;
    margin-right: 10px;
`

const ConfigDialog = props => {
    const {
        open=false,
        // cctvs=[],
        cctvsNotSelected=[],
        cctvsSelected=[],
        setCCTVsSelectedAray,
        setCCTVsNotSelectedArray,
        setDialogOpen=()=>{},
        checkedCCTVId,
        setCheckedCCTVId,
        optionTitle="Select CCTVs",
        // columnData={},
        // columnOrder=[],
        // setColumnData=()=>{},
        // groupByArea=true,
        displayGrid=true,
        gridDimension=2,
        autoInterval=10,
        // setGroupByArea=()=>{},
        preload=false,
        setOptionsNSave=()=>{},
        addManualUrl,
        setRefreshMode,
        refreshMode,
        setRefreshInterval,
        refreshInterval
        // setPreload=()=>{}
        // cctvsInDropOn=[]
    } = props;

    // const [columnItems, setColumnItems] = React.useState({});
    // React.useEffect(() => {
    //     setColumnItems({
    //         'dragFrom': [...cctvsNotSelected],
    //         'dropOn': [...cctvsSelected]
    //     })
    // }, [cctvsNotSelected, cctvsSelected])

    const checkedInSelected = checkedCCTVId && cctvsSelected.some(cctv => cctv.cctvId === checkedCCTVId);
    const allCCTVs = React.useMemo(() => {
        return [...cctvsNotSelected, ...cctvsSelected]
    },[cctvsNotSelected, cctvsSelected])

    const methods = React.useMemo(() => {
        return {
            dragFrom: setCCTVsNotSelectedArray,
            dropOn: setCCTVsSelectedAray
        }
    },[setCCTVsNotSelectedArray, setCCTVsSelectedAray])

    const columnItems = React.useMemo(() => {
        return {
            dragFrom: cctvsNotSelected,
            dropOn: cctvsSelected
        }
    },[cctvsNotSelected, cctvsSelected])

    console.log('re-render filter :', columnItems, preload)

    const onCloseFilterDialog = () => {
        setDialogOpen(false);
    }

    const onDragEnd = React.useCallback(result => {
        const {destination, source} = result;
        const MOVE_OUTSIDE = !destination;
        const NOT_MOVED = !MOVE_OUTSIDE && destination.droppableId === source.droppableId && destination.index === source.index;
        if(MOVE_OUTSIDE || NOT_MOVED) return;

        const sourceIndex = source.index;
        const targetIndex = destination.index;

        const sourceArray = columnItems[source.droppableId];
        const targetArray = columnItems[destination.droppableId];

        const setSourceMethod = methods[source.droppableId];
        const setTargetMethod = methods[destination.droppableId];

        const DROP_IN_SAME_COLUMN = source.droppableId ===  destination.droppableId;
        if(DROP_IN_SAME_COLUMN){
            // exchange cctvIds;
            const newArray = moveTo(targetArray).fromIndex(sourceIndex).toIndex(targetIndex);
            setSourceMethod([...newArray]);
        }

        const DROP_IN_OTHER_COLUMN = source.droppableId !==  destination.droppableId;
        if(DROP_IN_OTHER_COLUMN){
            const sourceCCTV = sourceArray[sourceIndex];
            const newSourceArray = remove(sourceArray).fromIndex(sourceIndex);
            const newTargetArray = add(targetArray).toIndex(targetIndex).value(sourceCCTV);
            setSourceMethod([...newSourceArray]);
            setTargetMethod([...newTargetArray]);
        }
    },[columnItems, methods])

    const moveAllCCTVs = React.useCallback((fromColumnName) => {
        // not works.
        // if(fromColumnName === 'dragFrom'){
        //     setCCTVsNotSelectedArray([]);
        //     setCCTVsSelectedAray(selected => {
        //         return [...selected, cctvsNotSelected];
        //     });
        // } 
        // if(fromColumnName === 'dragOn'){
        //     setCCTVsSelectedAray([]);
        //     setCCTVsNotSelectedArray(notSelected => {
        //         return [...notSelected, cctvsSelected];
        //     });
        // } 
    },[cctvsNotSelected, cctvsSelected, setCCTVsNotSelectedArray, setCCTVsSelectedAray])

    const handleChangeGridDimension = React.useCallback(event => {
        setOptionsNSave('gridDimension', event.target.value)
    },[setOptionsNSave])

    const handleChangeAutoInterval = React.useCallback(event => {
        setOptionsNSave('autoInterval', event.target.value)
    },[setOptionsNSave])

    const onChangeMode = React.useCallback((event) => {
        if(event.target.checked){
            setOptionsNSave('refreshMode', 'auto');
            // setRefreshMode('auto')
        } else {
            setOptionsNSave('refreshMode', 'none');
            // setRefreshMode('none')
        }
    }, [setOptionsNSave])

    const onChangeInterval = React.useCallback((event) => {
        const interval = parseInt(event.target.value);
        // eslint-disable-next-line use-isnan
        if(isNaN(interval)){
            setOptionsNSave('refreshInterval', 0);
            // setRefreshInterval(0);
            return;
        }
        setOptionsNSave('refreshInterval', interval);
        // setRefreshInterval(interval);
    }, [setOptionsNSave])

    const refreshInputDisabled = refreshMode !== 'auto'

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Dialog
                open={open}
                onClose={onCloseFilterDialog}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle id="scroll-dialog-title">
                    <Box display="flex" flexDirection="row">
                        {optionTitle}
                        <Box style={{marginLeft:'auto'}}>
                        </Box>
                        {displayGrid &&
                            <Row>
                                <input 
                                    onChange={onChangeMode} 
                                    type="checkbox" 
                                    checked={!refreshInputDisabled}
                                />
                                <Box sx={{}}>auto refresh</Box>
                                {!refreshInputDisabled && (
                                    <input 
                                        disabled={refreshInputDisabled} 
                                        style={{height: '85%', marginLeft: '5px'}}
                                        onChange={onChangeInterval}
                                        value={refreshInterval}
                                    ></input>
                                )}
                            </Row>
                        }
                        {displayGrid && 
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={gridDimension}
                                onChange={handleChangeGridDimension}
                                row
                            >
                                <FormControlLabel value="2" control={<Radio size="small" />} label="2X2" />
                                <FormControlLabel value="3" control={<Radio size="small"/>} label="3X3" />
                            </RadioGroup>
                        }
                        {displayGrid &&
                            <input type="text" onChange={handleChangeAutoInterval} value={autoInterval}>
                            </input>
                        }
                    </Box>
                </DialogTitle>
                {/* <DialogContent dividers={scroll === 'paper'}> */}
                    <DialogContentText
                        id="scroll-dialog-description"
                        tabIndex={-1}
                    >
                        <Box display="flex" justifyContent="space-around">
                            {columnNames.map(columnName => (
                                <Column
                                    key={columnName}
                                    columnName={columnName}
                                    columnItems={columnItems[columnName]}
                                    moveAllCCTVs={moveAllCCTVs}
                                    checkedCCTVId={checkedCCTVId}
                                    setCheckedCCTVId={setCheckedCCTVId}
                                    setCCTVs={methods[columnName]}
                                >
                                </Column>
                            ))}
                        </Box>
                    </DialogContentText>
                {/* </DialogContent> */}
                <AddManualUrl
                    allCCTVs={allCCTVs}
                    checkedCCTVId={checkedCCTVId}
                    checkedInSelected={checkedInSelected}
                    setCCTVsSelectedArray={setCCTVsSelectedAray}
                    setCCTVsNotSelectedArray={setCCTVsNotSelectedArray} 
                ></AddManualUrl>
            </Dialog>
        </DragDropContext>
    )
}

export default React.memo(ConfigDialog)