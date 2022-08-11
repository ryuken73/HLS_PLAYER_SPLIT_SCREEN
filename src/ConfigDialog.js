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

const ConfigDialog = props => {
    const {
        open=false,
        cctvs=[],
        cctvsSelected=[],
        setDialogOpen=()=>{},

        optionTitle="Filter CCTVs",
        columnData={},
        // columnOrder=[],
        setColumnData=()=>{},
        groupByArea=true,
        displayGrid=false,
        gridDimension=2,
        autoInterval=10,
        // setGroupByArea=()=>{},
        preload=false,
        setOptionsNSave=()=>{},
        addManualUrl
        // setPreload=()=>{}
        // cctvsInDropOn=[]
    } = props;



    const [cctvsFrom, setCCTVsFrom] = React.useState([]);
    const [columnItems, setColumnItems] = React.useState({});
    React.useEffect(() => {
        const cctvNotSelected = cctvs.reduce((acct, cctv) => {
            const isSelected = cctvsSelected.some(selected => {
                return selected.cctvId === cctv.cctvId;
            })
            if(!isSelected){
                return [...acct, cctv];
            }
            return [...acct];
        }, [])
        // setCCTVsFrom(cctvNotSelected);
        setColumnItems({
            'dragFrom': [...cctvNotSelected],
            'dropOn': [...cctvsSelected]
        })
    }, [cctvs, cctvsSelected])

    console.log('re-render filter :', preload)
    const onCloseFilterDialog = () => {
        setDialogOpen(false);
    }

    const onDragEnd = React.useCallback(result => {
        const {destination, source} = result;
        const MOVE_OUTSIDE = !destination;
        const NOT_MOVED = !MOVE_OUTSIDE && destination.droppableId === source.droppableId && destination.index === source.index;
        if(MOVE_OUTSIDE || NOT_MOVED) return;

        const DROP_IN_SAME_COLUMN = source.droppableId ===  destination.droppableId;
        if(DROP_IN_SAME_COLUMN){
            // exchange cctvIds;
            const targetColumn = columnData[source.droppableId]
            const sourceIndex = source.index;
            const destinationIndex = destination.index;
            const newCCTVIds = moveTo(targetColumn.cctvIds).fromIndex(sourceIndex).toIndex(destinationIndex);
            const newTargetColumn = {
                ...targetColumn,
                cctvIds: newCCTVIds
            }
            setColumnData({
                ...columnData,
                [source.droppableId]:{
                    ...newTargetColumn
                }
            })
        }
        // console.log('###',result, source.droppableId, source.index, destination.droppableId, destination.index);
        const DROP_IN_OTHER_COLUMN = source.droppableId !==  destination.droppableId;
        if(DROP_IN_OTHER_COLUMN){
            const sourceColumn = columnData[source.droppableId];
            const targetColumn = columnData[destination.droppableId];
            const sourceIndex = source.index;
            const targetIndex = destination.index;
            const sourceCCTVId = sourceColumn.cctvIds[sourceIndex];
            const newSourceCCTVIds = remove(sourceColumn.cctvIds).fromIndex(sourceIndex);
            const newTargetCCTVIds = add(targetColumn.cctvIds).toIndex(targetIndex).value(sourceCCTVId);
            const newSourceColumn = {
                ...sourceColumn,
                cctvIds: newSourceCCTVIds
            }
            const newTargetColumn = {
                ...targetColumn,
                cctvIds: newTargetCCTVIds
            }
            setColumnData({
                ...columnData,
                [source.droppableId]:{
                    ...newSourceColumn
                },
                [destination.droppableId]:{
                    ...newTargetColumn
                }
            })
        }

    },[columnData])

    const handleChange = React.useCallback(event => {
        setOptionsNSave('groupByArea', event.target.checked);
    },[])

    const handleChangePreload = React.useCallback(event => {
        console.log(event.target.checked)
        setOptionsNSave('preload', event.target.checked)
    },[])

    const handleChangeDisplayGrid = React.useCallback(event => {
        setOptionsNSave('displayGrid', event.target.checked)
    },[])

    const handleChangeGridDimension = React.useCallback(event => {
        setOptionsNSave('gridDimension', event.target.value)
    },[])

    const handleChangeAutoInterval = React.useCallback(event => {
        setOptionsNSave('autoInterval', event.target.value)
    },[])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Dialog
                open={open}
                onClose={onCloseFilterDialog}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="scroll-dialog-title">
                    <Box display="flex" flexDirection="row">
                        {optionTitle}
                        <Box style={{marginLeft:'auto'}}>
                            {!groupByArea && !displayGrid &&
                            <FormControlLabel 
                                control={<Checkbox color="primary" size="small" checked={preload} onChange={handleChangePreload} />} 
                                label="미리보기" 
                            />
                            }
                            {!displayGrid &&
                            <FormControlLabel 
                                control={<Checkbox color="primary" size="small" checked={groupByArea} onChange={handleChange} />} 
                                label="지역별로 묶기" 
                            />
                            }
                            <FormControlLabel 
                                control={<Checkbox color="primary" size="small" checked={displayGrid} onChange={handleChangeDisplayGrid} />} 
                                label="분할화면" 
                            />
                        </Box>
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
                                    // title={columnData[columnName].title}
                                    // column={columnData[columnName]}
                                    // columnData={columnData}
                                    // cctvs={cctvs}
                                    // setColumnData={setColumnData}

                                    columnName={columnName}
                                    columnItems={columnItems[columnName]}
                                >
                                </Column>
                            ))}
                        </Box>
                    </DialogContentText>
                {/* </DialogContent> */}
                <AddManualUrl></AddManualUrl>
            </Dialog>
        </DragDropContext>
    )
}

export default React.memo(ConfigDialog)