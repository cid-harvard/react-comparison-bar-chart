import React, {useState, useRef, useEffect} from 'react';
import styled, {keyframes} from 'styled-components/macro';
import orderBy from 'lodash/orderBy';
import debounce from 'lodash/debounce';
import raw from 'raw.macro';
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

interface WithDyanmicFont {
  $dynamicFont: string; // should be value of clamp
}

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

const Row = styled.div`
  display: contents;
`;
const Cell = styled.div`
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

export interface BarDatum {
  id: string,
  title: string,
  value: number,
  color: string,
}

export interface RowHoverEvent {
  datum: BarDatum | undefined;
  mouseCoords: {x: number, y: number};
}

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

enum Category {
  Primary,
  Secondary,
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
  const [hoveredId, setHoveredId] = useState<BarDatum['id'] | undefined>(undefined); 
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
    const ref = i === 0 ? chartRef : undefined;
    const isRowVisible = expanded || (i < nValuesToShow || i > totalValues - (nValuesToShow + 1));
    const category: Category = i < orderedPrimaryData.length ? Category.Primary : Category.Secondary;
    const style: React.CSSProperties = isRowVisible ? {
      height: rowHeight,
      backgroundColor: hoveredId === d.id ? '#f1f1f1' : undefined,
    } : {
      height: 0,
      pointerEvents: 'none',
      transitionDelay: '0.15s',
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
          transitionDelay: isRowVisible ? '0.3s' : undefined,
        }}
      />
    ) : null;
    const rightBar = category === Category.Primary ? (
      <Bar
        className={'react-comparison-bar-chart-bar react-comparison-bar-chart-bar-right'}
        style={{
          backgroundColor: d.color,
          width: isRowVisible ? `${d.value / secondaryMax * 100}%` : 0,
          transitionDelay: isRowVisible ? '0.3s' : undefined,
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
    return (
      <Row
        key={d.id}
      >
        <Cell
          style={style}
          onMouseMove={onMouseMove}
        >
          {label}
        </Cell>
        <Cell style={style} />
        <BarCell
          style={style}
          ref={ref}
          onMouseMove={onMouseMove}
        >
          <RangeLeft style={{width: `${secondaryRange}%`}}>
            {leftBar}
          </RangeLeft>
          <RangeRight style={{width: `${primaryRange}%`}}>
            {rightBar}
          </RangeRight>
        </BarCell>
      </Row>
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
          onMouseLeave={onMouseLeave}
          className={'react-comparison-bar-chart-grid'}
        >
          <ExpandButtonRow
            style={{top: (gridHeight / 2)}}
            className={'react-comparison-bar-chart-expand-button-container'}
          >
            <ExpandButton
              onClick={() => setExpanded(current => !current)}
              onMouseEnter={onMouseLeave}
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
