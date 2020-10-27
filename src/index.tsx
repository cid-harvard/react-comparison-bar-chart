import React from 'react'
import Root, {
  Props as ComparisonBarChartProps,
} from './components/Root';
import {
  BarDatum,
  RowHoverEvent,
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
}

export default ComparisonBarChart;
