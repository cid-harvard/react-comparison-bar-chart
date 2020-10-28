import React, {useState} from 'react';
import styled, {keyframes} from 'styled-components/macro';
import {
  WithDyanmicFont,
  BarDatum,
  Category,
  RowHoverEvent,
} from './Utils';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const Root = styled.div`
  display: contents;
`;

const LabelText = styled.div<WithDyanmicFont>`
  width: 100%;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  opacity: 0;
  animation: ${fadeIn} 0.15s linear 1 forwards 0.3s;
`;

const Cell = styled.div`
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const BarCell = styled(Cell)`
  display: flex;
`;

const RangeBase = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const RangeLeft = styled(RangeBase)`
  border-right: solid 1px #333;
  justify-content: flex-end;
`;

const RangeRight = styled(RangeBase)`
  border-left: solid 1px #333;
`;

const Bar = styled.div`
  height: 70%;
  transition: width 0.2s ease-in-out;
`;

interface Props {
  i: number;
  d: BarDatum;
  expanded: boolean;
  totalPrimaryValues: number;
  totalSecondaryValues: number;
  totalValues: number;
  rowHeight: number;
  orderedPrimaryData: BarDatum[];
  gridHeight: number;
  primaryMax: number;
  secondaryMax: number;
  onRowHover: undefined | ((event: RowHoverEvent) => void);
  secondaryRange: number;
  primaryRange: number;
  chartRef: React.MutableRefObject<HTMLDivElement | null>;
}

const maxCellsForAnimation = 900;

const Row = (props: Props) => {
  const {
    i, d, expanded, totalPrimaryValues, totalSecondaryValues, rowHeight, totalValues, gridHeight,
    orderedPrimaryData, primaryMax, secondaryMax, onRowHover,
    secondaryRange, primaryRange, chartRef,
  } = props;

  const [hoveredId, setHoveredId] = useState<BarDatum['id'] | undefined>(undefined); 
  
  const ref = i === 0 ? chartRef : undefined;
  const isRowVisible = expanded || (i < totalPrimaryValues || i > totalValues - (totalSecondaryValues + 1));
  if (!isRowVisible && totalValues > maxCellsForAnimation) {
    return null;
  }
  const category: Category = i < orderedPrimaryData.length ? Category.Primary : Category.Secondary;
  const style: React.CSSProperties = isRowVisible ? {
    height: rowHeight,
    backgroundColor: hoveredId === d.id ? '#f1f1f1' : undefined,
  } : {
    height: 0,
    pointerEvents: 'none',
    transitionDelay: totalValues <= maxCellsForAnimation ? '0.15s' : undefined,
  };
  const label = isRowVisible ? (
    <LabelText
      className={'react-comparison-bar-chart-row-label'}
      $dynamicFont={`clamp(0.5rem, ${gridHeight * 0.04}px, 0.9rem)`}
    >
      {d.title}
    </LabelText>
  ) : null;
  const leftBar = category === Category.Secondary ? (
    <Bar
      className={'react-comparison-bar-chart-bar react-comparison-bar-chart-bar-left'}
      style={{
        backgroundColor: d.color,
        width: isRowVisible ? `${d.value / secondaryMax * 100}%` : 0,
        transitionDelay: isRowVisible && totalValues <= maxCellsForAnimation ? '0.3s' : undefined,
      }}
    />
  ) : null;
  const rightBar = category === Category.Primary ? (
    <Bar
      className={'react-comparison-bar-chart-bar react-comparison-bar-chart-bar-right'}
      style={{
        backgroundColor: d.color,
        width: isRowVisible ? `${d.value / primaryMax * 100}%` : 0,
        transitionDelay: isRowVisible && totalValues <= maxCellsForAnimation ? '0.3s' : undefined,
      }}
    />
  ) : null;
  const onMouseMove = (e: React.MouseEvent) => {
    setHoveredId(d.id);
    if (onRowHover) {
      onRowHover({
        datum: d,
        mouseCoords: {
          x: e.clientX,
          y: e.clientY,
        },
      })
    }
  }

  const onMouseLeave = (e: React.MouseEvent) => {
    setHoveredId(undefined);
    if (onRowHover) {
      onRowHover({
        datum: undefined,
        mouseCoords: {
          x: e.clientX,
          y: e.clientY,
        },
      })
    }
  }

  return (
    <Root>
      <Cell
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {label}
      </Cell>
      <Cell
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      />
      <BarCell
        style={style}
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <RangeLeft style={{width: `${secondaryRange}%`}}>
          {leftBar}
        </RangeLeft>
        <RangeRight style={{width: `${primaryRange}%`}}>
          {rightBar}
        </RangeRight>
      </BarCell>
    </Root>
  );
}

export default React.memo(Row);
