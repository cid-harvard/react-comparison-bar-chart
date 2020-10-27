import React, {useState, useRef, useEffect} from 'react';
import styled from 'styled-components/macro';
import orderBy from 'lodash/orderBy';
import debounce from 'lodash/debounce';
import raw from 'raw.macro';
import Row from './Row';
import {
  WithDyanmicFont,
  BarDatum,
  RowHoverEvent,
} from './Utils';
const ArrowCollapseSVG = raw('../assets/arrow-collapse.svg');
const ArrowExpandSVG = raw('../assets/arrow-expand.svg');

const titleHeight = 120; // in px
const overflowPadding = 1; // in rem. Needed to allow for final axis value to remain visible

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-top: ${titleHeight}px;
  padding-right: ${overflowPadding}rem;
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
  display: grid;
  grid-template-rows: 1fr 2rem;
`;

const TitleRoot = styled.div<WithDyanmicFont>`
  margin-left: auto;
  display: flex;
  height: ${titleHeight}px;
  position: absolute;
  top: 0;
  right: 0;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  padding-right: ${overflowPadding}rem;
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

const Axis = styled.div`
  margin-left: auto;
  display: flex;
  border-top: solid 2px #333;
`;

const Grid = styled.div`
  width: 100%;
  height: 100%;
  grid-row: 1;
  display: grid;
  grid-template-columns: clamp(75px, 300px, 25%) 2rem 1fr;
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
`;

const AxisLeft = styled(AxisValue)`
  justify-content: flex-end;
`;

const AxisText = styled.span<WithDyanmicFont>`
  transform: translate(-50%, 0);
  font-size: ${({$dynamicFont}) => $dynamicFont};
`;

const AxisLine = styled.div`
  position: absolute;
  top: 0;
  height: calc(100% - 2rem);
  width: 0;
  border-right: solid 1px #dfdfdf;
`;

const AxisTitle = styled.div<WithDyanmicFont>`
  position: absolute;
  right: 0;
  z-index: 1;
  font-size: ${({$dynamicFont}) => $dynamicFont};
  transform: translate(0, -100%);
  display: flex;
  justify-content: flex-end;
  text-align: right;
  padding: 0 0 0.3rem 1rem;
  box-sizing: border-box;
  pointer-events: none;
`;

export interface Props {
  primaryData: BarDatum[];
  secondaryData: BarDatum[];
  nValuesToShow: number;
  formatValue?: (value: number) => string | number;
  titles?: {
    primary?: {
      h1: string,
      h2?: string,
    }
    secondary?: {
      h1: string,
      h2?: string,
    }
  }
  expandCollapseText?: {
    toExpand: string,
    toCollapse: string,
  }
  axisLabel?: string;
  onRowHover?: (event: RowHoverEvent) => void;
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
    primaryData, secondaryData, nValuesToShow, formatValue, titles, expandCollapseText, axisLabel,
    onRowHover,
  } = props;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [{gridHeight, chartWidth}, setMeasurements] = useState<Measurements>({gridHeight: 0, chartWidth: 0});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (rootRef && rootRef.current && chartRef && chartRef.current) {
      setMeasurements({gridHeight: rootRef.current.offsetHeight, chartWidth: chartRef.current.offsetWidth});
    }
  }, [rootRef, chartRef])

  useEffect(() => {
    const updateWindowWidth = debounce(() => {
      if (rootRef && rootRef.current && chartRef && chartRef.current) {
        setMeasurements({gridHeight: rootRef.current.offsetHeight, chartWidth: chartRef.current.offsetWidth});
      }
    }, 10);
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

  const orderedPrimaryData = orderBy(primaryData, ['value'], 'desc');
  const orderedSecondaryData = orderBy(secondaryData, ['value'], 'desc');
  const primaryTop = orderedPrimaryData.slice(0, nValuesToShow);
  const secondaryTop = orderedSecondaryData.slice(0, nValuesToShow);

  const primaryMax = roundUpToHalf(primaryTop[0].value);
  const secondaryMax = roundUpToHalf(secondaryTop[0].value);
  const totalRange = primaryMax + secondaryMax;
  const secondaryRange = secondaryMax / totalRange * 100
  const primaryRange = primaryMax / totalRange * 100

  const totalValues = primaryData.length + secondaryData.length;
  const totalTopValues = primaryTop.length + secondaryTop.length;
  const rowHeight = gridHeight ? (1 / totalTopValues) * gridHeight : 0;

  const rows = [...orderedPrimaryData, ...orderedSecondaryData.reverse()].map((d, i) => {
    return (
      <Row
        key={d.id}
        i={i}
        d={d}
        expanded={expanded}
        nValuesToShow={nValuesToShow}
        totalValues={totalValues}
        rowHeight={rowHeight}
        orderedPrimaryData={orderedPrimaryData}
        gridHeight={gridHeight}
        secondaryMax={secondaryMax}
        onRowHover={onRowHover}
        secondaryRange={secondaryRange}
        primaryRange={primaryRange}
        chartRef={chartRef}
      />
    );
  })

  const totalAxisValues = 11;
  const axisIncrement = totalRange / totalAxisValues;
  const totalValuesLeftOfZero = Math.round(secondaryMax / totalRange * totalAxisValues);
  const totalValuesRightOfZero = totalAxisValues - totalValuesLeftOfZero;
  const axisValuesLeft: React.ReactElement<any>[] = [];

  for (let i = 1; i < totalValuesLeftOfZero + 1; i++) {
    const value = axisIncrement * i;
    if (value <= secondaryMax) {
      const formatted = formatValue ? formatValue(value) : value;
      axisValuesLeft.push(
        <AxisValue
          key={'axis-value-' + i}
          style={{width: chartWidth / totalAxisValues}}
          className={'react-comparison-bar-chart-axis-value'}
        >
          <AxisLine />
          <AxisText
            $dynamicFont={`clamp(0.45rem, ${chartWidth * 0.035}px, 1rem)`}
          >
            {formatted}
          </AxisText>
        </AxisValue>
      );
    }
  }

  const axisValuesRight: React.ReactElement<any>[] = [];
  for (let i = 0; i < totalValuesRightOfZero + 1; i++) {
    const line = i !== 0 ? <AxisLine /> : null;
    const value = axisIncrement * i;
    if (value <= primaryMax) {
      const formatted = formatValue ? formatValue(value) : value;
      axisValuesRight.push(
        <AxisValue
          key={'axis-value-' + i}
          style={{width: chartWidth / totalAxisValues}}
          className={'react-comparison-bar-chart-axis-value'}
        >
          {line}
          <AxisText
            $dynamicFont={`clamp(0.45rem, ${chartWidth * 0.035}px, 1rem)`}
          >
            {formatted}
          </AxisText>
        </AxisValue>
      );
    }
  }

  const axisTitle = axisLabel ? (
    <AxisTitle
      style={{width: (primaryRange / 100) * chartWidth}}
      className={'react-comparison-bar-chart-axis-title'}
      $dynamicFont={`clamp(0.75rem, ${chartWidth * 0.025}px, 1.1rem)`}
    >
      {axisLabel}
    </AxisTitle>
  ) : null;

  const h1Left = titles && titles.secondary ? (
    <H1>{titles.secondary.h1}</H1>
  ) : null;
  const h2Left = titles && titles.secondary && titles.secondary.h2 ? (
    <H2>{titles.secondary.h2}</H2>
  ) : null;
  const h1Right = titles && titles.primary ? (
    <H1>{titles.primary.h1}</H1>
  ) : null;
  const h2Right = titles && titles.primary && titles.primary.h2 ? (
    <H2>{titles.primary.h2}</H2>
  ) : null;

  let expandCollapseButtonText: string;
  if (expanded) {
    expandCollapseButtonText = expandCollapseText ? expandCollapseText.toCollapse : 'Collapse';
  } else {
    expandCollapseButtonText = expandCollapseText ? expandCollapseText.toExpand : 'Expand';
  }

  return (
    <Container>
      <TitleRoot
        style={{width: chartWidth}}
        $dynamicFont={`clamp(0.65rem, ${chartWidth * 0.03}px, 0.95rem)`}
      >
        <TitleLeft style={{width: `${secondaryRange}%`}}>
          <div className={'react-comparison-bar-chart-title react-comparison-bar-chart-title-left'}>
            {h1Left}
            {h2Left}
          </div>
        </TitleLeft>
        <TitleRight style={{width: `${primaryRange}%`}}>
          <div className={'react-comparison-bar-chart-title react-comparison-bar-chart-title-right'}>
            {h1Right}
            {h2Right}
          </div>
        </TitleRight>
      </TitleRoot>
      <ChartContainer>
        <Axis
          style={{width: chartWidth}}
          className={'react-comparison-bar-chart-axis'}
        >
          <AxisLeft style={{width: `${secondaryRange}%`}}>
            {axisValuesLeft.reverse()}
          </AxisLeft>
          <AxisValue style={{width: `${primaryRange}%`}}>
            {axisValuesRight}
          </AxisValue>
          {axisTitle}
        </Axis>
        <Grid
          ref={rootRef}
          style={{gridTemplateRows: 'repeat(${totalValues}, auto)'}}
          className={'react-comparison-bar-chart-grid'}
        >
          <ExpandButtonRow
            style={{top: (gridHeight / 2)}}
            className={'react-comparison-bar-chart-expand-button-container'}
          >
            <ExpandButton
              onClick={() => setExpanded(current => !current)}
              className={'react-comparison-bar-chart-expand-button'}
              $dynamicFont={`clamp(0.7rem, ${chartWidth * 0.015}px, 0.85rem)`}
              $dynamicMaxWidth={chartWidth > 300 ? `${chartWidth * 0.25}px` : '75px'}
            >
              <Arrow
                dangerouslySetInnerHTML={{__html: expanded ? ArrowCollapseSVG : ArrowExpandSVG}}
              /> {expandCollapseButtonText}
            </ExpandButton>
          </ExpandButtonRow>
          {rows}
        </Grid>
      </ChartContainer>
    </Container>
  );
}

export default Root;
