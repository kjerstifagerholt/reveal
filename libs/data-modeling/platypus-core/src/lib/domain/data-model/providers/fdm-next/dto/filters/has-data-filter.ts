import { ContainerReference } from '../dms-container-dtos';
import { ViewReference } from '../dms-view-dtos';

export interface HasDataFilter {
  hasData: Array<
    | (ContainerReference & { type: 'container' })
    | (ViewReference & { type: 'view' })
  >;
}
