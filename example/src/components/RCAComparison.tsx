import React, { useRef } from 'react';
import ComparisonBarChart, {
  Direction,
  RowHoverEvent,
} from 'react-comparison-bar-chart';
import { getStandardTooltip, RapidTooltipRoot } from './rapidTooltip';
import { rgba } from 'polished';
import data from '../data/rca-comparison.json';
import styled from 'styled-components';
import { scaleLog } from 'd3-scale';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 3rem;

  @media (max-width: 720px) {
    padding: 0.75rem;
  }
`;

function gcd(a: number, b: number): number {
  return (b) ? gcd(b, a % b) : a;
}

export const decimalToFraction = function (decimal: number) {
  let top: number | string = decimal.toString().replace(/\d+[.]/, '');
  const bottom: number = Math.pow(10, top.length);
  if (decimal > 1) {
    top = +top + Math.floor(decimal) * bottom;
  }
  const x = gcd(top as number, bottom);
  return {
    top: (top as number / x),
    bottom: (bottom / x),
    display: (top as number / x) + ':' + (bottom / x),
  };
};

const Industries = () => {

  const tooltipRef = useRef<HTMLDivElement | null>(null);

  let max = Math.ceil((Math.max(...data.filteredIndustryRCA.map(d => d.rca as number)) * 1.1) / 10) * 10;
  let min = Math.min(...data.filteredIndustryRCA.map(d => d.rca as number));
  if (max < 10) {
    max = 10;
  }
  if (min >= 1) {
    min = 0.1;
  }
  let scale = scaleLog()
    .domain([min, max])
    .range([0, 100])
    .nice();

  min = parseFloat(scale.invert(0).toFixed(5));
  max = parseFloat(scale.invert(100).toFixed(5));

  if (max.toString().length > min.toString().length - 1) {
    min = 1 / max;
  } else if (max.toString().length < min.toString().length - 1) {
    max = 1 / min;
  }

  scale = scaleLog()
    .domain([min, max])
    .range([0, 100])
    .nice();
  const highPresenceScale = scaleLog()
    .domain([1, max])
    .range([0, 100])
    .nice();

  const lowPresenceScale = scaleLog()
    .domain([1, min])
    .range([0, 100])
    .nice();

  const formatValue = (value: number, direction: Direction) => {
    const scale = direction === Direction.Over ? highPresenceScale : lowPresenceScale;
    const scaledValue = parseFloat(scale.invert(value).toFixed(5));
    if (scaledValue >= 1) {
      return <>{scaledValue}<strong>×</strong></>;
    } else {
      const { top, bottom } = decimalToFraction(scaledValue);
      return <><sup>{top}</sup>&frasl;<sub>{bottom}</sub><strong>×</strong></>;
    }
  };

  const setHovered = (e: RowHoverEvent | undefined) => {
    const node = tooltipRef.current;
    if (node) {
      if (e && e.datum) {
        const { datum, mouseCoords } = e;
        const industry = data.filteredIndustryRCA.find(d => d.naicsId && d.naicsId.toString() === datum.id);
        const rows = [
          ['NAICS:', datum.id],
          ['RCA:', industry ? industry.rca.toFixed(3) : '0.000'],
        ];
        node.innerHTML = getStandardTooltip({
          title: datum.title,
          color: rgba(datum.color, 0.3),
          rows,
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

  return (
    <Root>
      <ComparisonBarChart
        primaryData={data.highPresenceData}
        secondaryData={data.lowPresenceData}
        formatValue={formatValue}
        highlighted={undefined}
        onRowHover={setHovered}
        nValuesToShow={10}
        numberOfXAxisTicks={6}
      // centerLineValue={scale(1) as number}
      // centerLineLabel={centerLineLabel}
      // overMideLineLabel={getString('global-specialization-over')}
      // underMideLineLabel={getString('global-specialization-under')}
      // scrollDownText={getString('global-specialization-scroll')}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  );
};

export default Industries;
