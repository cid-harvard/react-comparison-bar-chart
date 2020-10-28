import React, {useState, useRef, useEffect} from 'react';
import styled from 'styled-components/macro';
import orderBy from 'lodash/orderBy';
import raw from 'raw.macro';
import Row, {highlightedIdName} from './Row';
import {
  WithDyanmicFont,
  BarDatum,
  RowHoverEvent,
  Layout,
} from './Utils';
const ArrowCollapseSVG = raw('../assets/arrow-collapse.svg');
const ArrowExpandSVG = raw('../assets/arrow-expand.svg');

const titleHeight = 120; // in px
const overflowPadding = 1; // in rem. Needed to allow for final axis value to remain visible

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-top: ${titleHeight}px;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const TitleRoot = styled.div<WithDyanmicFont>`
  margin-left: auto;
  display: flex;
  height: ${titleHeight}px;
  position: absolute;
  top: 0;
  font-size: ${({$dynamicFont}) => $dynamicFont};
`;

const AxisLines = styled.div`
  position: absolute;
  top: ${titleHeight}px;
  width: 100%;
  display: flex;
`;

const TitleBase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
`;

const TitleLeft = styled(TitleBase)`
  border-right: solid 1px #333;
  align-items: flex-end;
  padding-right: 1.5rem;
`;

const TitleRight = styled(TitleBase)`
  border-left: solid 1px #333;
  padding-left: 1.5rem;
`;

const H1 = styled.h1`
  font-size: inherit;
  text-transform: uppercase;
  margin: 0;
  font-weight: 400;
`;
const H2 = styled.h2`
  font-size: inherit;
  margin: 0;
  font-weight: 400;
`;

const Grid = styled.div`
  width: 100%;
  height: 100%;
  grid-row: 1;
  display: grid;
  position: relative;
  /* both auto and overlay required for browsers that don't support overlay */
  overflow: auto;
  overflow-y: overlay;
  overflow-x: hidden

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, .3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, .1);
  }
`;

const ExpandButtonRow = styled.div`
  grid-column: 1 / -1;
  pointer-events: none;
  position: sticky;
  height: 0;
  display: flex;
`;

const ExpandButton = styled.button<WithDyanmicFont & {$dynamicMaxWidth: string}>`
  pointer-events: all;
  margin-left: auto;
  border: none;
  background-color: transparent;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  max-width: ${({$dynamicMaxWidth}) => $dynamicMaxWidth};
  text-shadow:
   -1px -1px 0 #fff,  
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
     1px 1px 0 #fff;
  transform: translate(0, 1rem);

  &:focus:not(:focus-visible) {
    outline: none;
  }
`;

const Arrow = styled.span`
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;

  svg {
    width: 100%;
    height: 100%;

    .cls-1 {
      fill: none;
      stroke: #2d2d2d;
      stroke-miterlimit: 10;
      stroke-width: 0.94px;
    }

    .cls-2 {
      fill: #2d2d2d;
    }
  }

`;

const AxisValue = styled.div`
  display: flex;
  flex-shrink: 0;
  background-color: #fff;
  position: relative;
  pointer-events: none;


  &:after {
    content: '';
    width: 100%;
    height: 0;
    position: absolute;
    bottom: 0;
  }

  &:not(:last-child) {
    &:after {
      border-bottom: solid 2px #333;
      z-index: 10;
    }
  }

  :last-child {
    &:after {
      border-bottom: solid 2px transparent;
    }
  }
`;

const AxisText = styled.span<WithDyanmicFont>`
  font-size: ${({$dynamicFont}) => $dynamicFont};
  transform: translate(-50%, calc(100% + 4px));
  position: absolute;
  bottom: 0;
`;

const AxisLine = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 0;
  border-left: solid 1px #dfdfdf;
`;

const AxisTitle = styled.div<WithDyanmicFont>`
  position: absolute;
  bottom: 0;
  z-index: 1;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  padding: 0 0 0.3rem 1rem;
  box-sizing: border-box;
  pointer-events: none;
  transform: translate(-1rem, 0);
`;

export interface Props {
  primaryData: BarDatum[];
  secondaryData: BarDatum[];
  nValuesToShow: number;
  formatValue?: (value: number) => string | number;
  titles?: {
    primary: string;
    secondary: string;
    format?: (label: string, count: number, max: number) => string;
  }
  expandCollapseText?: {
    toExpand: string,
    toCollapse: string,
  }
  axisLabel?: string;
  onRowHover?: (event: RowHoverEvent) => void;
  hideExpandCollapseButton?: boolean;
  initialExpanded?: boolean;
  layout?: Layout;
  highlighted?: string;
}

const roundUpToHalf = (value: number) => {
  const roundedUp = Math.ceil(value);
  const previousHalfValue = roundedUp - 0.5;
  if (previousHalfValue <= value) {
    return roundedUp;
  } else {
    return previousHalfValue;
  }
}

interface Measurements {
  gridHeight: number,
  chartWidth: number,
}

const Root = (props: Props) => {
  const {
    primaryData, secondaryData, nValuesToShow, formatValue, titles, expandCollapseText,
    axisLabel, onRowHover, hideExpandCollapseButton, initialExpanded, layout, highlighted,
  } = props;

  if (!primaryData.length && !secondaryData.length) {
    return null;
  }

  const leftData = layout === Layout.Right ? primaryData : secondaryData;
  const rightData = layout === Layout.Right ? secondaryData : primaryData;

  const [expanded, setExpanded] = useState<boolean>(initialExpanded ? true : false);
  const [{gridHeight, chartWidth}, setMeasurements] = useState<Measurements>({gridHeight: 0, chartWidth: 0});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (rootRef && rootRef.current && chartRef && chartRef.current) {
      setMeasurements({gridHeight: rootRef.current.offsetHeight, chartWidth: chartRef.current.offsetWidth});
    }
  }, [rootRef, chartRef])

  useEffect(() => {
    const updateWindowWidth = () => {
      if (rootRef && rootRef.current && chartRef && chartRef.current) {
        setMeasurements({gridHeight: rootRef.current.offsetHeight, chartWidth: chartRef.current.offsetWidth});
      }
    };
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  useEffect(() => {
    if (rootRef && rootRef.current) {
      const rootNode = rootRef.current;
      const highlightedElm: HTMLElement | null = rootRef.current.querySelector(`#${highlightedIdName}`);
      if (highlightedElm) {
        const highlightedRect = highlightedElm.getBoundingClientRect();
        if (highlightedRect.height) {
          rootNode.scrollTop = highlightedElm.offsetTop;
        } else {
          setExpanded(true)
          setTimeout(() => {
            rootNode.scrollTop = highlightedElm.offsetTop;
          }, 500)
        }
      }
    }
  }, [rootRef, highlighted]);

  const orderedRightData = orderBy(rightData, ['value'], 'desc');
  const orderedLeftData = orderBy(leftData, ['value'], 'desc');
  const rightTop = orderedRightData.slice(0, nValuesToShow);
  const leftTop = orderedLeftData.slice(0, nValuesToShow);

  let rightTopValue = rightTop.length ? rightTop[0].value : 0;
  let leftTopValue = leftTop.length ? leftTop[0].value : 0;
  if (!rightTopValue) {
    rightTopValue = leftTopValue;
  }
  if (!leftTopValue) {
    leftTopValue = rightTopValue;
  }
  if (!leftTopValue && !rightTopValue) {
    rightTopValue = 1;
    leftTopValue = 1;
  }

  const rawTotalRange = rightTopValue + leftTopValue;
  let rightMax: number;
  let leftMax: number;
  let axisIncrement: number;
  if (rawTotalRange < 7) {
    rightMax = roundUpToHalf(rightTopValue);
    leftMax = roundUpToHalf(leftTopValue);
    axisIncrement = 0.5;
  } else if (rawTotalRange < 14) {
    rightMax = Math.ceil(rightTopValue);
    leftMax = Math.ceil(leftTopValue);
    axisIncrement = 1;
  } else if (rawTotalRange < 21) {
    rightMax = 2 * Math.ceil(rightTopValue / 2);
    leftMax = 2 * Math.ceil(leftTopValue / 2);
    axisIncrement = 2;
  } else {
    rightMax = 3 * Math.ceil(rightTopValue / 3);
    leftMax = 3 * Math.ceil(leftTopValue / 3);
    axisIncrement = 3;
  }

  const totalRange = rightMax + leftMax;
  const leftRange = leftMax / totalRange * 100
  const rightRange = rightMax / totalRange * 100

  const totalValues = rightData.length + leftData.length;
  const totalTopValues = rightTop.length + leftTop.length;
  const rowHeight = gridHeight ? ((1 / totalTopValues) * gridHeight) : 0;

  const rows = [...orderedRightData, ...orderedLeftData.reverse()].map((d, i) => {
    return (
      <Row
        key={d.id}
        i={i}
        d={d}
        expanded={expanded}
        totalRightValues={rightTop.length}
        totalLeftValues={leftTop.length}
        totalValues={totalValues}
        rowHeight={rowHeight}
        orderedRightData={orderedRightData}
        gridHeight={gridHeight}
        rightMax={rightMax}
        leftMax={leftMax}
        onRowHover={onRowHover}
        leftRange={leftRange}
        rightRange={rightRange}
        chartRef={chartRef}
        layout={layout}
        highlighted={highlighted}
      />
    );
  })

  if (layout === Layout.Right) {
    rows.reverse();
  }

  const totalAxisValues = totalRange / axisIncrement;
  const totalValuesLeftOfZero = Math.round((leftRange / 100) * totalAxisValues);
  const totalValuesRightOfZero = totalAxisValues - totalValuesLeftOfZero;

  let axisFontSize: string;
  if (chartWidth < gridHeight) {
    axisFontSize = `clamp(0.55rem, ${chartWidth * 0.025}px, 1rem)`;
  } else {
    axisFontSize = `clamp(0.55rem, ${gridHeight * 0.025}px, 1rem)`;
  }
  const axisWidth = chartWidth / totalAxisValues;

  const axisLines: React.ReactElement<any>[] = [];
  for (let i = totalValuesLeftOfZero + 1; i > 0; i--) {
    const value = axisIncrement * i;
    if (value <= leftMax) {
      const formatted = formatValue ? formatValue(value) : value;
      axisLines.push(
        <AxisValue
          key={'axis-line-left-' + i}
          style={{width: axisWidth}}
          className={'react-comparison-bar-chart-axis-value'}
        >
          <AxisText
            $dynamicFont={axisFontSize}
          >
            {formatted}
          </AxisText>
          <AxisLine />
        </AxisValue>
      );
    }
  }

  for (let i = 0; i < totalValuesRightOfZero + 1; i++) {
    const value = axisIncrement * i;
    if (value <= rightMax) {
      const formatted = formatValue ? formatValue(value) : value;
      axisLines.push(
        <AxisValue
          key={'axis-line-right-' + i}
          style={{width: axisWidth}}
          className={'react-comparison-bar-chart-axis-value'}
        >
          <AxisText
            $dynamicFont={axisFontSize}
          >
            {formatted}
          </AxisText>
          <AxisLine />
        </AxisValue>
      );
    }
  }

  const axisTitle = axisLabel ? (
    <AxisTitle
      style={{
        width: layout !== Layout.Right ? (rightRange / 100) * chartWidth : (leftRange / 100) * chartWidth,
        right: layout !== Layout.Right ? 0 : undefined,
        textAlign: layout !== Layout.Right ? 'right' : undefined,
      }}
      className={'react-comparison-bar-chart-axis-title'}
      $dynamicFont={`clamp(0.75rem, ${chartWidth * 0.025}px, 1.1rem)`}
    >
      {axisLabel}
    </AxisTitle>
  ) : null;

  const titleFormatter = titles && titles.format ? titles.format : (label: string) => label;

  let titleLeft: string | undefined;
  let titleRight: string | undefined;
  if (layout === Layout.Right) {
    titleLeft = titles && titles.primary ? titles.primary : undefined;
    titleRight = titles && titles.secondary ? titles.secondary : undefined;
  } else {
    titleLeft = titles && titles.secondary ? titles.secondary : undefined;
    titleRight = titles && titles.primary ? titles.primary : undefined;
  }

  const h1Left = titleLeft ? (
    <H1>{titleFormatter(titleLeft, leftTop.length, orderedLeftData.length)}</H1>
  ) : null;
  const h2Left = titleLeft && titleRight ? (
    <H2>{titleLeft} {'>'} {titleRight}</H2>
  ) : null;
  const h1Right = titles && titleRight ? (
    <H1>{titleFormatter(titleRight, rightTop.length, orderedRightData.length)}</H1>
  ) : null;
  const h2Right = titleLeft && titleRight ? (
    <H2>{titleRight} {'>'} {titleLeft}</H2>
  ) : null;

  let expandCollapseButtonText: string;
  if (expanded) {
    expandCollapseButtonText = expandCollapseText ? expandCollapseText.toCollapse : 'Collapse';
  } else {
    expandCollapseButtonText = expandCollapseText ? expandCollapseText.toExpand : 'Expand';
  }

  const expandCollapseButton = hideExpandCollapseButton ||
    (rightTop.length < nValuesToShow && leftTop.length < nValuesToShow)
    ? null : (
      <ExpandButton
        onClick={() => setExpanded(current => !current)}
        className={'react-comparison-bar-chart-expand-button'}
        style={{
        }}
        $dynamicFont={`clamp(0.7rem, ${chartWidth * 0.015}px, 0.85rem)`}
        $dynamicMaxWidth={chartWidth > 300 ? `${chartWidth * 0.25}px` : '75px'}
      >
        <Arrow
          dangerouslySetInnerHTML={{__html: expanded ? ArrowCollapseSVG : ArrowExpandSVG}}
        /> {expandCollapseButtonText}
      </ExpandButton>
    );

    const buffer: React.CSSProperties = layout !== Layout.Right
      ? {paddingRight: overflowPadding + 'rem'} : {paddingLeft: overflowPadding + 'rem'};

  return (
    <Container
      style={{...buffer}}
    >
      <TitleRoot
        style={{
          width: chartWidth,
          marginLeft: layout !== Layout.Right ? undefined : 0,
          right: layout !== Layout.Right ? 0 : undefined,
          left: layout !== Layout.Right ? undefined : 0,
          ...buffer,
        }}
        $dynamicFont={`clamp(0.65rem, ${chartWidth * 0.03}px, 0.95rem)`}
      >
        <TitleLeft style={{width: `${leftRange}%`}}>
          <div className={'react-comparison-bar-chart-title react-comparison-bar-chart-title-left'}>
            {h1Left}
            {h2Left}
          </div>
        </TitleLeft>
        <TitleRight style={{width: `${rightRange}%`}}>
          <div className={'react-comparison-bar-chart-title react-comparison-bar-chart-title-right'}>
            {h1Right}
            {h2Right}
          </div>
        </TitleRight>
        <AxisLines style={{height: gridHeight}}>
          {axisTitle}
          {axisLines}
        </AxisLines>
      </TitleRoot>
      <ChartContainer>
        <Grid
          ref={rootRef}
          style={{
            gridTemplateRows: 'repeat(${totalValues}, auto)',
            gridTemplateColumns: layout !== Layout.Right
              ? 'clamp(75px, 300px, 25%) 2rem 1fr'
              : '1fr 2rem clamp(75px, 300px, 25%)',
            overflow: expanded ? undefined : 'hidden',
          }}
          className={'react-comparison-bar-chart-grid'}
        >
          <ExpandButtonRow
            style={{
              top: (gridHeight / 2),
              width: layout !== Layout.Right ? undefined : chartWidth,
            }}
            className={'react-comparison-bar-chart-expand-button-container'}
          >
            {expandCollapseButton}
          </ExpandButtonRow>
          {rows}
        </Grid>
      </ChartContainer>
    </Container>
  );
}

export default Root;
