import { Handler } from './schema';

export interface ExtendedHandler extends Handler {
  mainResolved: string;
  handlerOutputPathResolved: string;
}
