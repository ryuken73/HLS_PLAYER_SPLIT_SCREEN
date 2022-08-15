import React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import {remove} from './lib/arrayUtil';

const Container = styled.div`
    display: flex;
    align-items: center;
    border: 1px solid;
    margin: 3px;
    padding: 3px;
    background-color: ${props => (props.isDragging ? props.colorDragging : props.colorDefault)};
    color: white;
    border-radius: 3px;
    font-size: 14px;
`
const StyledRadio = styled(Checkbox)`
    color: white !important;
    padding: 1px !important;
    padding-right: 5px !important;
`
const StyledClearIcon = styled(ClearIcon)`
    color: white !important;
`
const DragItem = props => {
    const {
        id, 
        itemText, 
        index, 
        checked=false,
        setChecked,
        setCCTVs
    } = props;
    const stringId = id.toString();
    const {colorDefault='grey', colorDragging='royalblue'} = props;

    const onChange = React.useCallback((event) => {
        setChecked(id, event.target.checked)
    },[id, setChecked])

    const removeItem = React.useCallback(() => {
        setCCTVs(cctvs => {
            return remove(cctvs).fromIndex(index)
        })
    },[index, setCCTVs])
    
    return (
        <Draggable key={id} draggableId={stringId} index={index}>
            {(provided, snapshot) => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    isDragging={snapshot.isDragging}
                    colorDefault={colorDefault}
                    colorDragging={colorDragging}
                >
                    <StyledRadio size="small" checked={checked} onChange={onChange}></StyledRadio>
                    <Box>
                        {itemText}
                    </Box>
                    <Box sx={{marginLeft:'auto'}}>
                        <IconButton onClick={removeItem} aria-label="remove" size="small">
                            <StyledClearIcon fontSize="small" />
                        </IconButton>                        
                    </Box>
                </Container>
            )}
        </Draggable>
    )
}

export default React.memo(DragItem);