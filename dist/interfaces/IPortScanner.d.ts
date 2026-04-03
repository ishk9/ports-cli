import { PortEntry } from '../types';
export interface IPortScanner {
    scan(devOnly: boolean): Promise<PortEntry[]>;
}
//# sourceMappingURL=IPortScanner.d.ts.map