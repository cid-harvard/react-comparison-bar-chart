import React, {useState} from 'react';
import ComparisonBarChart, {
  BarDatum,
  RowHoverEvent,
  Layout,
} from 'react-comparison-bar-chart';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import {rgba} from 'polished';

const colorMap = [
  { id: '0', color: '#A973BE' },
  { id: '1', color: '#F1866C' },
  { id: '2', color: '#FFC135' },
  { id: '3', color: '#93CFD0' },
  { id: '4', color: '#488098' },
  { id: '5', color: '#77C898' },
  { id: '6', color: '#6A6AAD' },
  { id: '7', color: '#D35162' },
  { id: '8', color: '#F28188' },
]

interface NaicsDatum {
  naics_id: number,
  code: string,
  name: string,
  level: number,
  parent_id: number | null,
  parent_code: string | null,
  code_hierarchy: string,
  naics_id_hierarchy: string,
}

const naicsData: NaicsDatum[] = JSON.parse(raw('../data/naics_2017.json'));

let bostonTotal = 0;
const bostonData: BarDatum[] = [];
JSON.parse(raw('../data/boston-3digit-shares.json'))
  .forEach(({naics_id, num_employ}: {naics_id: number, num_employ: number}) => {
    const industry = naicsData.find(d => d.naics_id === naics_id);
    let topLevelParentId: string = naics_id.toString();
    let current: NaicsDatum | undefined = naicsData.find(datum => datum.naics_id === naics_id);
    while(current && current.parent_id !== null) {
      // eslint-disable-next-line
      current = naicsData.find(datum => datum.naics_id === (current as NaicsDatum).parent_id);
      if (current && current.parent_id !== null) {
        topLevelParentId = current.parent_id.toString();
      } else if (current && current.naics_id !== null) {
        topLevelParentId = current.naics_id.toString();
      }
    }
    if (parseInt(topLevelParentId, 10) > 8) {
      console.error(current);
      throw new Error('Parent out of range')
    }
    const parentColor = colorMap.find(c => c.id === topLevelParentId);
    if (industry && parentColor) {
      bostonTotal += num_employ;
      bostonData.push({
        id: naics_id.toString(),
        title: industry.name,
        value: num_employ,
        color: parentColor.color,
      })
    }
  });

let newYorkTotal = 0;
const newYorkData: BarDatum[] = [];
JSON.parse(raw('../data/newyork-3digit-shares.json'))
  .forEach(({naics_id, num_employ}: {naics_id: number, num_employ: number}) => {
    const industry = naicsData.find(d => d.naics_id === naics_id);
    let topLevelParentId: string = naics_id.toString();
    let current: NaicsDatum | undefined = naicsData.find(datum => datum.naics_id === naics_id);
    while(current && current.parent_id !== null) {
      // eslint-disable-next-line
      current = naicsData.find(datum => datum.naics_id === (current as NaicsDatum).parent_id);
      if (current && current.parent_id !== null) {
        topLevelParentId = current.parent_id.toString();
      } else if (current && current.naics_id !== null) {
        topLevelParentId = current.naics_id.toString();
      }
    }
    if (parseInt(topLevelParentId, 10) > 8) {
      console.error(current);
      throw new Error('Parent out of range')
    }
    const parentColor = colorMap.find(c => c.id === topLevelParentId);
    if (industry && parentColor) {
      newYorkTotal += num_employ;
      newYorkData.push({
        id: naics_id.toString(),
        title: industry.name,
        value: num_employ,
        color: parentColor.color,
      })
    }
  });

const sharesDataBoston: BarDatum[] = [];
bostonData.forEach(d => {
  const newYorkDatum = newYorkData.find(ny => ny.id === d.id);
  const bostonShare = d.value / bostonTotal;
  const newYorkShare = newYorkDatum ? newYorkDatum.value / newYorkTotal : 0;
  const difference = bostonShare - newYorkShare;
  if (difference > 0) {
    sharesDataBoston.push({...d, value: difference * 100})
  }
});
const sharesDataNewYork: BarDatum[] = [];
newYorkData.forEach(d => {
  const bostonDatum = bostonData.find(bost => bost.id === d.id);
  const newYorkShare = d.value / newYorkTotal;
  const bostonShare = bostonDatum ? bostonDatum.value / bostonTotal : 0;
  const difference = newYorkShare - bostonShare;
  if (difference > 0) {
    sharesDataNewYork.push({...d, value: difference * 100})
  }
});

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 3rem;

  @media (max-width: 720px) {
    padding: 0.75rem;
  }
`;

const Tooltip = styled.div`
  position: fixed;
  z-index: 3000;
  max-width: 16rem;
  padding-bottom: 0.5rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  transition: opacity 0.15s ease;
  color: #333;
  background-color: #fff;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 1.5rem));
`;

const TooltipTitle = styled.div`
  padding: 0.5rem;
`;

const TooltipSubsectionGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 0.5rem;
  padding: 0.5rem;
`;

const SemiBold = styled.span`
  font-weight: 500;
  display: flex;
  justify-content: flex-end;
  text-align: right;
`;
const Cell = styled.div`
  display: flex;
  justify-content: flex-end;
  text-align: right;
`;

const ArrowContainer = styled.div`
  width: 100%;
  height: 0.5rem;
  display: flex;
  justify-content: center;
  position: absolute;
  transform: translate(0, 100%);
`;

const Arrow = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  position: relative;
  display: flex;
  justify-content: center;
  left: -0.25rem;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-top: 9px solid #dfdfdf;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 1px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #fff;
  }
`;

const Input = styled.input`
  position: absolute;
  top: 0;
  left: 0;
`;

const formatValue = (value: number) => {
  return parseFloat((value).toFixed(1)) + '%';
}

const BostonNewYork3Digit = () => {
  const [value, setValue] = useState<string>('');
  const [highlighted, setHighlighted] = useState<string | undefined>(undefined);
  const [hovered, setHovered] = useState<RowHoverEvent | undefined>(undefined);

  let tooltip: React.ReactElement<any> | null;
  if (hovered && hovered.datum) {
    const {datum, mouseCoords} = hovered;
    const bostonDatum = bostonData.find(d => d.id === datum.id);
    const newYorkDatum = newYorkData.find(d => d.id === datum.id);
    const newYorkValue = newYorkDatum ? newYorkDatum.value / newYorkTotal * 100 : 0;
    const bostonValue = bostonDatum ? bostonDatum.value / bostonTotal * 100 : 0;
    const nyDiff = newYorkValue > bostonValue ? '+' + datum.value.toFixed(2) + '%' : '';
    const bosDiff = bostonValue > newYorkValue ? '+' + datum.value.toFixed(2) + '%' : '';
    tooltip = (
      <Tooltip
        style={{left: mouseCoords.x, top: mouseCoords.y}}
      >
        <TooltipTitle style={{backgroundColor: rgba(datum.color, 0.3)}}>
          {datum.title}
        </TooltipTitle>
        <TooltipSubsectionGrid>
          <div />
          <SemiBold>New York</SemiBold>
          <SemiBold>Boston</SemiBold>
          <Cell>Share of Employees</Cell>
          <SemiBold>{newYorkValue.toFixed(2) + '%'}</SemiBold>
          <SemiBold>{bostonValue.toFixed(2) + '%'}</SemiBold>
          <Cell>Difference</Cell>
          <SemiBold>{nyDiff}</SemiBold>
          <SemiBold>{bosDiff}</SemiBold>
        </TooltipSubsectionGrid>
        <ArrowContainer>
          <Arrow />
        </ArrowContainer>
      </Tooltip>
    );
  } else {
    tooltip = null;
  }

  const titleFormatter = (label: string, count: number, max: number) => {
    const countText = count === max ? '' : `(Top ${count})`;
    return `Positive ${label} share (%) ${countText}`;
  }

  const onSubmit = (e: any) => {
    e.preventDefault();
    setHighlighted(value.length ? value : undefined);
  }

  return (
    <Root>
      <ComparisonBarChart
        primaryData={sharesDataBoston}
        secondaryData={sharesDataNewYork}
        nValuesToShow={10}
        formatValue={formatValue}
        titles={{
          primary: 'Boston Boston',
          secondary: 'New Yorkyorkyork',
          format: titleFormatter,
        }}
        expandCollapseText={{
          toExpand: 'Click to see all industries',
          toCollapse: 'Show only top industries',
        }}
        axisLabel={'Difference in Share'}
        onRowHover={e => setHovered(e)}
        highlighted={highlighted}
        onHighlightError={v => alert('Could not find ' + v)}
        layout={Layout.Left}
      />
      {tooltip}
      <form
        onSubmit={onSubmit}
      >
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </form>
    </Root>
  )
}

export default BostonNewYork3Digit;
