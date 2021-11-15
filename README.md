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
- **formatValue** *(optional)*: `(value: number, direction: Direction) => string | number | React.ReactNode`
- **titles** *(optional)*:
  - **primary**: `string`\
  - **secondary**: `string`\
  - **secondary** *(optional)*: `(label: string, count: number, max: number) => string`\
- **expandCollapseText** *(optional)*: { **toExpand**: `string`, **toCollapse**: `string` }
- **axisLabel** *(optional)*: `string`
- **onRowHover** *(optional)*: [`(event: RowHoverEvent) => void`](#rowhoverevent)
- **hideExpandCollapseButton** *(optional)*: `boolean`
- **initialExpanded** *(optional)*: `boolean`
- **layout** *(optional)*: [`Layout`](#layout)
- **highlighted** *(optional)*: `string`
- **onExpandCollapseButtonHover** *(optional)*: `(event: React.MouseEvent<HTMLElement>) => void`
- **onHighlightError** *(optional)*: `(value: string) => void`
- **numberOfXAxisTicks** *(optional)*: `number`

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

<a name="layout"/>

#### Layout

The Layout type is an enum with the following values:

- **Layout.Left** = `left`
- **Layout.Right** = `right`

## License

MIT © [The President and Fellows of Harvard College](https://www.harvard.edu/)
