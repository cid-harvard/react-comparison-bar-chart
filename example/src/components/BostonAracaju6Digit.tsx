import React, {useRef} from 'react';
import ComparisonBarChart, {
  BarDatum,
  RowHoverEvent,
} from 'react-comparison-bar-chart';
import styled from 'styled-components/macro';
import raw from 'raw.macro';
import {rgba} from 'polished';
import {getStandardTooltip, RapidTooltipRoot} from './rapidTooltip';

const primaryTotal = 169706;
const secondaryTotal = 57741;

interface FilteredDatum {
  id: string;
  title: string;
  value: number;
  color: string;
  topLevelParentId: string;
}

const {
  filteredPrimaryData, filteredSecondaryData,
}: {
  filteredPrimaryData: FilteredDatum[], filteredSecondaryData: FilteredDatum[],
} = JSON.parse(raw('../data/boston-aracaju-6-digit-data.json'));

const primaryData: BarDatum[] = [];
const secondaryData: BarDatum[] = [];
  filteredPrimaryData.forEach(d => {
    const secondaryDatum = filteredSecondaryData.find(d2 => d2.id === d.id);
    const primaryShare = d.value / primaryTotal;
    const secondaryShare = secondaryDatum ? secondaryDatum.value / secondaryTotal : 0;
    const difference = primaryShare - secondaryShare;
    if (difference > 0) {
      primaryData.push({...d, value: difference * 100});
    }
  });
  filteredSecondaryData.forEach(d => {
    const primaryDatum = filteredPrimaryData.find(d2 => d2.id === d.id);
    const secondaryShare = d.value / secondaryTotal;
    const primaryShare = primaryDatum ? primaryDatum.value / primaryTotal : 0;
    const difference = secondaryShare - primaryShare;
    if (difference > 0) {
      secondaryData.push({...d, value: difference * 100});
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

const formatValue = (value: number) => {
  return parseFloat((value).toFixed(1)) + '%';
}

const BostonNewYork3Digit = () => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const {datum, mouseCoords} = e;
        const primaryDatum = filteredPrimaryData.find(d => d.id === datum.id);
        const secondaryDatum = filteredSecondaryData.find(d => d.id === datum.id);
        const secondaryValue = secondaryDatum ? secondaryDatum.value / secondaryTotal * 100 : 0;
        const primaryValue = primaryDatum ? primaryDatum.value / primaryTotal * 100 : 0;
        const primaryDiff = primaryValue > secondaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
        const secondaryDiff = secondaryValue > primaryValue ? '+' + datum.value.toFixed(2) + '%' : '';
        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: rgba(datum.color, 0.3),
          rows: [
            ['', 'Aracaju', 'Boston'],
            ['Share of Employees', secondaryValue.toFixed(2) + '%', primaryValue.toFixed(2) + '%'],
            ['Difference', secondaryDiff, primaryDiff],
          ],
          boldColumns: [1, 2],
        });
        node.style.top = mouseCoords.y + 'px';
        node.style.left = mouseCoords.x + 'px';
        node.style.display = 'block';
      } else {
        node.style.display = 'none';
      }
    }
  };

  const titleFormatter = (label: string, count: number, max: number) => {
    const countText = count === max ? '' : `(Top ${count})`;
    return `Positive ${label} share (%) ${countText}`;
  }

  return (
    <Root>
      <ComparisonBarChart
        primaryData={primaryData}
        secondaryData={secondaryData}
        nValuesToShow={10}
        formatValue={formatValue}
        titles={{
          primary: 'Boston',
          secondary: 'Aracaju',
          format: titleFormatter,
        }}
        expandCollapseText={{
          toExpand: 'Click to see all industries',
          toCollapse: 'Show only top industries',
        }}
        axisLabel={'Difference in Share'}
        onRowHover={e => setHovered(e)}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  )
}

export default BostonNewYork3Digit;
