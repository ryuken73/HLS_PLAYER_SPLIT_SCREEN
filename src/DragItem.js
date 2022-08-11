import React from 'react'
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
    border: 1px solid;
    margin: 3px;
    padding: 3px;
    background-color: ${props => (props.isDragging ? props.colorDragging : props.colorDefault)};
    color: white;
    border-radius: 3px;
    font-size: 14px;
`
const DragItem = props => {
    // const {cctv, index} = props;
    const {id, itemText, index} = props;
    const stringId = id.toString();
    const {colorDefault='grey', colorDragging='royalblue'} = props;
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
                    {itemText}
                </Container>
            )}
        </Draggable>
    )
}

export default React.memo(DragItem);