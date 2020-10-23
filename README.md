# react-comparison-bar-chart

## by the Growth Lab at Harvard's Center for International Development

Vertical comparison bar chart component for comparing the difference in values between two datasets.

> This package is part of Harvard Growth Lab’s portfolio of software packages, digital products and interactive data visualizations.  To browse our entire portfolio, please visit [growthlab.app](https://growthlab.app/).  To learn more about our research, please visit [Harvard Growth Lab’s](https://growthlab.cid.harvard.edu/) home page.

[![NPM](https://img.shields.io/npm/v/react-comparison-bar-chart.svg)](https://www.npmjs.com/package/react-comparison-bar-chart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### [View live example ↗](https://cid-harvard.github.io/react-comparison-bar-chart/)

## Install

```bash
npm install --save react-comparison-bar-chart
```

## Usage

```tsx
import React from 'react'
import ComparisonBarChart from 'react-comparison-bar-chart';

const App = () => {

  ...

  return (
    <ComparisonBarChart
      primaryData={primaryDataset}
      secondaryData={secondaryDataset}
      nValuesToShow={10}
    />
  )
}

export default App

```

<a name="props"/>

#### Props

The ComparisonBarChart component takes the following props:

- **primaryData**: [`BarDatum[]`](#bardatum)
- **secondaryData**: [`BarDatum[]`](#bardatum)
- **nValuesToShow**: `number`
- **formatValue** *(optional)*: `(value: number) => string | number`
- **titles** *(optional)*:
  - **primary** *(optional)*: { **h1**: `string`, **h2** *(optional)*: `string` }\
  - **secondary** *(optional)*: { **h1**: `string`, **h2** *(optional)*: `string` }\
- **expandCollapseText** *(optional)*: { **toExpand**: `string`, **toCollapse**: `string` }
- **axisLabel** *(optional)*: `string`
- **onRowHover** *(optional)*: [`(event: RowHoverEvent) => void`](#rowhoverevent)

<a name="bardatum"/>

#### BarDatum

The BarDatum type is an interface of the following values:

- **id**: `string`
- **title**: `string`
- **value**: `number`
- **color**: `string`

<a name="rowhoverevent"/>

#### RowHoverEvent

The RowHoverEvent type is an interface of the following values:

- **datum**: [`BarDatum[]`](#bardatum) \| `undefined`
- **mouseCoords**: {**x**: `number`, **y**: `number`}

## License

MIT © [The President and Fellows of Harvard College](https://www.harvard.edu/)
