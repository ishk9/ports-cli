import { PortEntry } from '../types';

export interface IPortScanner {
  scan(devOnly: boolean): Promise<PortEntry[]>;
}
