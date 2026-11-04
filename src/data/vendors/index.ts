import type { VendorConfig } from './types';
import { SJ } from './sj';
import { CHEN } from './chen';
import { TL } from './tl';

/** Class A vendors — deliver to store. Order matters: it is the order shown on /staff. */
export const VENDORS: VendorConfig[] = [SJ, CHEN, TL];
export const vendorById = (id: string) => VENDORS.find(v => v.id === id);
export * from './types';
