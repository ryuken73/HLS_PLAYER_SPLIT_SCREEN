import React from 'react';
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import DragItem from './DragItem';

const Container = styled.div`
    height: 500px;
    width: 45%;
    border: 1px solid;
    overflow: auto; 
    border-radius: 3px;
    display: flex;
    flex-direction: column;
`
const Title = styled.h5`
  padding: 3px;
  margin: 3px;
`

const CCTVList = styled.div`
    padding: 8px;
    transition: background-color 0.2s ease;
    background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')};
    flex-grow: 1;
`

const Column = props => {
    // console.log('#### re-render Column:', props.column)
    // const {title, column, cctvs, columnData} = props;
    // const {setColumnData=()=>{}} = props;
    // const {cctvIds} = column;
    // const [columnItems, setColumnItems] = React.useState([]);
    // React.useEffect(() => {
        // const cctvsInColumn = cctvIds.map(cctvId => cctvs.find(cctv => cctv.cctvId === cctvId))
        // setColumnItems(cctvsInColumn);
    // },[cctvIds, cctvs])
    const {columnName, columnItems} = props;
    const onClickLink = () => {};
    console.log(columnName, columnItems)

    // const onClickLink = React.useCallback(() => {
    //     const newColumnData = {...columnData};
    //     const currentColumnId = column.id;
    //     const targetColumnId = currentColumnId === 'dragFrom' ? 'dropOn' : 'dragFrom';
    //     const currentCCTVIds = [...newColumnData[currentColumnId].cctvIds];
    //     const targetCCTVIds = [...newColumnData[targetColumnId].cctvIds];
    //     const newTargetCCTVIds = [...targetCCTVIds, ...currentCCTVIds];
    //     const newCurrentCCTVIds = [];
    //     const newData = {
    //         [currentColumnId]:{
    //             ...columnData[currentColumnId],
    //             cctvIds: newCurrentCCTVIds
    //         },
    //         [targetColumnId]:{
    //             ...columnData[targetColumnId],
    //             cctvIds: newTargetCCTVIds
    //         }
    //     }

    //     setColumnData(newData)
    // },[column, columnData])

    const itemColorDefault = columnName === 'dragFrom' ? 'skyblue':'darkblue'

    return (
        <Container>
            <Box
                display="flex"
                alignItems="center"
            >
                <Title>{columnName} [{columnItems.length}]</Title>
                <Box style={{marginLeft:'auto'}}>
                    <Link component="button" onClick={onClickLink}>
                        <Title>{columnName === "dragFrom" ? "Move All" : "Clear All"}</Title>
                    </Link>
                </Box>

            </Box>
            <Droppable droppableId={columnName}>
                {(provided, snapshot) => (
                    <CCTVList
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        isDraggingOver={snapshot.isDraggingOver}
                    >
                        {columnItems.map((cctv, index) => (
                            <DragItem 
                                key={cctv.cctvId} 
                                id={cctv.cctvId}
                                itemText={cctv.title}
                                index={index} 
                                colorDefault={itemColorDefault}
                            />
                        ))}
                        {provided.placeholder}
                    </CCTVList>
                )}
            </Droppable>
        </Container>
    )
}


export default React.memo(Column)