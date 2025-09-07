import { InjectionToken } from '@angular/core';

export type CreateWorkerType = (...args: any[]) => Promise<any>;

export const TESSERACT_CREATE_WORKER = new InjectionToken<CreateWorkerType>('TESSERACT_CREATE_WORKER');

