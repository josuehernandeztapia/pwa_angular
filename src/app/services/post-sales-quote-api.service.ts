import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { PartSuggestion } from './post-sales-quote-draft.service';

// Allows adding simple ad-hoc line items without full PartSuggestion shape
export interface SimpleLineItem {
  id?: string;
  name: string;
  unitPrice: number;
  oem?: string;
  equivalent?: string;
}

export interface DraftQuoteResponse {
  quoteId: string;
  number?: string;
}

export interface AddLineResponse {
  quoteId: string;
  lineId: string;
  total?: number;
  currency?: string;
}

@Injectable({ providedIn: 'root' })
export class PostSalesQuoteApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/bff/odoo/quotes`;

  // Backwards-compatible alias used by components
  createOrGetDraft(clientId?: string, meta?: any): Observable<DraftQuoteResponse> {
    return this.getOrCreateDraftQuote(clientId, meta);
  }

  getOrCreateDraftQuote(clientId?: string, meta?: any): Observable<DraftQuoteResponse> {
    if (!environment.features.enableOdooQuoteBff) {
      return of({ quoteId: 'dev-draft' });
    }
    const body: any = { clientId, meta };
    return this.http.post<any>(this.base, body).pipe(
      map(res => ({ quoteId: res.quoteId || res.id || 'unknown', number: res.number }))
    );
  }

  addLine(quoteId: string, part: PartSuggestion | SimpleLineItem, qty: number = 1, meta?: any): Observable<AddLineResponse> {
    if (!environment.features.enableOdooQuoteBff) {
      return of({ quoteId: quoteId || 'dev-draft', lineId: `dev-${Date.now()}` });
    }
    const body: any = {
      sku: (part as any).id,
      name: (part as any).name,
      oem: (part as any).oem,
      equivalent: (part as any).equivalent,
      qty,
      unitPrice: (part as any).priceMXN ?? (part as any).unitPrice,
      currency: 'MXN',
      meta
    };
    return this.http.post<any>(`${this.base}/${quoteId}/lines`, body).pipe(
      map(res => ({ quoteId: res.quoteId || quoteId, lineId: res.lineId || res.id, total: res.total, currency: res.currency }))
    );
  }
}

