export type BreadcrumbsDataType = {
  label: string;
  component?: React.Component;
  componentProps?: any;
};

export enum BreadcrumbsTypeEnum {
  direction = 'direction',
  tab = 'tab',
}
