import React from 'react'
import Root, {
  Props as ComparisonBarChartProps,
  BarDatum,
} from './components/Root'

const ComparisonBarChart = (props: ComparisonBarChartProps) => {
  return (
    <Root {...props} />
  );
}

export {
  ComparisonBarChartProps,
  BarDatum,
}

export default ComparisonBarChart;
