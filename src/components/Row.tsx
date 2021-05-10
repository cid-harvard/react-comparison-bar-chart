import React from 'react';
import styled from 'styled-components/macro';
import {
  WithDyanmicFont,
  BarDatum,
  Category,
  RowHoverEvent,
  Layout,
  fadeIn,
} from './Utils';

export const highlightedIdName = 'react-comparison-bar-chart-highlighted-item';

const Root = styled.div`
  display: flex;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const LabelText = styled.div<WithDyanmicFont>`
  width: 100%;
  font-size: 0.68rem;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  animation: ${fadeIn} 0.15s linear 1 forwards 0.3s;
`;

export const Cell = styled.div`
  transition: height 0.3s ease-in-out;
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
  totalRightValues: number;
  totalLeftValues: number;
  totalValues: number;
  rowHeight: number;
  orderedRightData: BarDatum[];
  gridHeight: number;
  rightMax: number;
  leftMax: number;
  onRowHover: undefined | ((event: RowHoverEvent) => void);
  leftRange: number;
  rightRange: number;
  layout: Layout | undefined;
  highlighted: string | undefined;
  chartWidth: number;
  textWidth: number;
}

const Row = (props: Props) => {
  const {
    i, d, expanded, totalRightValues, totalLeftValues, rowHeight, totalValues, gridHeight,
    orderedRightData, rightMax, leftMax, onRowHover,
    leftRange, rightRange, layout, highlighted, chartWidth, textWidth,
  } = props;

  
  const isRowVisible = expanded || (i < totalRightValues || i > totalValues - (totalLeftValues + 1));
  const category: Category = i < orderedRightData.length ? Category.Primary : Category.Secondary;
  const style: React.CSSProperties = isRowVisible ? {
    height: rowHeight,
    backgroundColor: highlighted === d.id ? '#f1f1f1' : undefined,
  } : {
    height: 0,
    pointerEvents: 'none',
    transitionDelay: !highlighted ? '0.15s' : undefined,
  };
  const label = isRowVisible ? (
    <LabelText
      className={'react-comparison-bar-chart-row-label'}
      style={{
        textAlign: layout === Layout.Right ? 'left' : 'right',
      }}
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
        width: isRowVisible ? `${d.value / leftMax * 100}%` : 0,
        transitionDelay: isRowVisible && !highlighted ? '0.3s' : undefined,
      }}
    />
  ) : null;
  const rightBar = category === Category.Primary ? (
    <Bar
      className={'react-comparison-bar-chart-bar react-comparison-bar-chart-bar-right'}
      style={{
        backgroundColor: d.color,
        width: isRowVisible ? `${d.value / rightMax * 100}%` : 0,
        transitionDelay: isRowVisible && !highlighted ? '0.3s' : undefined,
      }}
    />
  ) : null;
  const onMouseMove = (e: React.MouseEvent) => {
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

  if (layout === Layout.Right) {
    return (
      <Root>
        <BarCell
          id={highlighted === d.id ? highlightedIdName : undefined}
          style={{...style, width: chartWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <RangeLeft style={{width: `${leftRange}%`}}>
            {leftBar}
          </RangeLeft>
          <RangeRight style={{width: `${rightRange}%`}}>
            {rightBar}
          </RangeRight>
        </BarCell>
        <Cell
          style={{...style, width: '2rem'}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />
        <Cell
          style={{...style, width: textWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {label}
        </Cell>
      </Root>
    );
  } else {
    return (
      <Root>
        <Cell
          style={{...style, width: textWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {label}
        </Cell>
        <Cell
          style={{...style, width: '2rem'}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />
        <BarCell
          id={highlighted === d.id ? highlightedIdName : undefined}
          style={{...style, width: chartWidth}}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <RangeLeft style={{width: `${leftRange}%`}}>
            {leftBar}
          </RangeLeft>
          <RangeRight style={{width: `${rightRange}%`}}>
            {rightBar}
          </RangeRight>
        </BarCell>
      </Root>
    );
  }

}

export default React.memo(Row);
