import React from 'react'
import Root, {
  Props as ComparisonBarChartProps,
  BarDatum,
  RowHoverEvent,
} from './components/Root'

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
