import React from 'react'
import Root, {
  Props as ComparisonBarChartProps,
  Direction,
} from './components/Root';
import {
  BarDatum,
  RowHoverEvent,
  Layout,
} from './components/Utils';

const ComparisonBarChart = (props: ComparisonBarChartProps) => {
  return (
    <Root {...props} />
  );
}

export {
  ComparisonBarChartProps,
  BarDatum,
  RowHoverEvent,
  Layout,
  Direction,
}

export default ComparisonBarChart;
