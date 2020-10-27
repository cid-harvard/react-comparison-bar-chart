export interface WithDyanmicFont {
  $dynamicFont: string; // should be value of clamp
}

export interface BarDatum {
  id: string,
  title: string,
  value: number,
  color: string,
}

export enum Category {
  Primary,
  Secondary,
}

export interface RowHoverEvent {
  datum: BarDatum | undefined;
  mouseCoords: {x: number, y: number};
}
