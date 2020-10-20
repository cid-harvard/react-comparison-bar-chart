import React, {useState, useRef, useEffect} from 'react';
import styled from 'styled-components/macro';
import orderBy from 'lodash/orderBy';
import debounce from 'lodash/debounce';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: grid;
  grid-template-rows: 1fr 2rem;
`;

const Title = styled.div`
  margin-left: auto;
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
  grid-template-columns: clamp(150px, 300px, 25%) 1fr;
  grid-column-gap: 1rem;
  position: relative;
  /* both auto and overlay required for browsers that don't support overlay */
  overflow: auto;
  overflow-y: overlay;

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
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
`;

const LabelText = styled.div`
  width: 100%;
  font-size: clamp(0.65rem, 2vh, 0.85rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
`;

const ExpandButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
`;

const BarCell = styled(Cell)`
  display: flex;
`;

const RangeBase = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
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
  margin-top: auto;
`;

const AxisValue = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const AxisLeft = styled(AxisValue)`
  justify-content: flex-end;
`;

const AxisText = styled.span`
  transform: translate(-50%, 0);
`;

const AxisLine = styled.div`
  position: absolute;
  top: 0;
  height: calc(100% - 2rem);
  width: 0;
  border-right: solid 1px #dfdfdf;
`;

export interface BarDatum {
  id: string,
  title: string,
  value: number,
  color: string,
}

export interface Props {
  primaryData: BarDatum[];
  secondaryData: BarDatum[];
  nValuesToShow: number;
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
  const {primaryData, secondaryData, nValuesToShow} = props;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [{gridHeight, chartWidth}, setMeasurements] = useState<Measurements>({gridHeight: 0, chartWidth: 0});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (rootRef && rootRef.current && chartRef && chartRef.current) {
      setMeasurements({gridHeight: rootRef.current.offsetHeight, chartWidth: chartRef.current.offsetWidth});
    }
  }, [rootRef, chartRef, expanded])

  useEffect(() => {
    const updateWindowWidth = debounce(() => {
      if (rootRef && rootRef.current && chartRef && chartRef.current) {
        setMeasurements({gridHeight: rootRef.current.offsetHeight, chartWidth: chartRef.current.offsetWidth});
      }
    }, 500);
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
      opacity: 1,
    } : {
      height: 0,
      opacity: 0,
      pointerEvents: 'none',
    };
    const leftBar = category === Category.Secondary ? (
      <Bar style={{backgroundColor: d.color, width: `${d.value / secondaryMax * 100}%`}} />
    ) : null;
    const rightBar = category === Category.Primary ? (
      <Bar style={{backgroundColor: d.color, width: `${d.value / primaryMax * 100}%`}} />
    ) : null;
    return (
      <Row
        key={d.id}
      >
        <Cell
          style={style}
        >
          <LabelText>{d.title}</LabelText>
        </Cell>
        <BarCell
          style={style}
          ref={ref}
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
    const value = parseFloat((axisIncrement * i).toFixed(1));
    if (value <= secondaryMax) {
      axisValuesLeft.push(
        <AxisValue
          key={'axis-value-' + i}
          style={{width: chartWidth / totalAxisValues}}
        >
          <AxisLine />
          <AxisText>
            {value}
          </AxisText>
        </AxisValue>
      );
    }
  }

  const axisValuesRight: React.ReactElement<any>[] = [];
  for (let i = 0; i < totalValuesRightOfZero + 1; i++) {
    const line = i !== 0 ? <AxisLine /> : null;
    const value = parseFloat((axisIncrement * i).toFixed(1));
    if (value <= primaryMax) {
      axisValuesRight.push(
        <AxisValue
          key={'axis-value-' + i}
          style={{width: chartWidth / totalAxisValues}}
        >
          {line}
          <AxisText>
            {value}
          </AxisText>
        </AxisValue>
      );
    }
  }

  return (
    <Container>
      <ExpandButton onClick={() => setExpanded(current => !current)}>
        Click to see all industries
      </ExpandButton>
      <Title style={{width: chartWidth}}>
        Title
      </Title>
      <ChartContainer>
        <Axis style={{width: chartWidth}}>
          <AxisLeft style={{width: `${secondaryRange}%`}}>
            {axisValuesLeft.reverse()}
          </AxisLeft>
          <AxisValue style={{width: `${primaryRange}%`}}>
            {axisValuesRight}
          </AxisValue>
        </Axis>
        <Grid ref={rootRef} style={{gridTemplateRows: 'repeat(${totalValues}, auto)'}}>
          {rows}
        </Grid>
      </ChartContainer>
    </Container>
  );
}

export default Root;
