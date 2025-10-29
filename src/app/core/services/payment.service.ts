import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'


export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  status: string
  created_at: string 
  customer_name?: string
  customer_email?: string
  card_info?: string
  method?: string
}


export interface PaymentStats {
  totalPayments: number
  totalAmount: number
  successfulPayments: number
  failedPayments: number
}

export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export interface PayoutResponse {
  success: boolean
  message: string
  payoutId?: string
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/payments'

  constructor(private http: HttpClient) {}

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/AllPayments`)
  }

  getStats(): Observable<PaymentStats> {
    return this.http.get<PaymentStats>(`${this.apiUrl}/stats`)
  }

  createCheckoutSession(payload: {
    amount: number
    userId: string
  }): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/create-checkout-session`,
      payload
    )
  }

  payoutToBank(payload: {
    userId: string
    amount: number
  }): Observable<PayoutResponse> {
    return this.http.post<PayoutResponse>(
      `${this.apiUrl}/payout-to-bank`,
      payload
    )
  }
}

