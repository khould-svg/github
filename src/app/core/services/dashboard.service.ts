import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface InvestmentSummary {
  total: number
  active: number
  pending: number
  completed: number
  totalInvestments: number
  activeInvestments: number
  pendingInvestments: number
  totalInvestedAmount: number
}

export interface PendingInvestment {
  _id: string
  investorName: string
  investorEmail: string
  propertyName: string
  amountInvested: number
  sharesPurchased: number
  investmentDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface PropertyCycleSummary {
  cycleId: string
  name: string
  progress: number
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'credit' | 'debit'
  date: string
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  currency: string
}

export interface WalletSummary {
  totalWallets: number
  totalBalance: number
}

export interface PropertyProgress {
  propertyId: string
  name: string
  progress: number
}

export interface InvestmentChartItem {
  label: string
  income: number
  expense: number
}

export interface InvestmentAnalytics {
  period: string
  total: number
  growthRate: number
  chartData: InvestmentChartItem[]
  income: number
  expense: number
  balance: number
}

export interface CountResponse {
  count: number
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/dashboard'

  constructor(private http: HttpClient) {}

  getInvestmentsSummary(): Observable<InvestmentSummary> {
    return this.http.get<InvestmentSummary>(
      `${this.apiUrl}/investments-summary`
    )
  }

  getPropertyCyclesSummary(): Observable<PropertyCycleSummary[]> {
    return this.http.get<PropertyCycleSummary[]>(
      `${this.apiUrl}/property-cycles-summary`
    )
  }

  getTransactionsDashboard(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/get-all-transactions`)
  }

  getTransactionsUser(userId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/get-all-transactions-user/${userId}`
    )
  }

  getWalletsDashboard(): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.apiUrl}/get-all-wallets`)
  }

  getWalletSummary(): Observable<WalletSummary> {
    return this.http.get<WalletSummary>(`${this.apiUrl}/wallet-summary`)
  }

  getPropertiesProgress(): Observable<PropertyProgress[]> {
    return this.http.get<PropertyProgress[]>(
      `${this.apiUrl}/properties-progress`
    )
  }

  getInvestmentsAnalytics(
    period: string = 'month'
  ): Observable<InvestmentAnalytics> {
    return this.http.get<InvestmentAnalytics>(
      `${this.apiUrl}/investments-analytics?period=${period}`
    )
  }

  getPendingInvestments(): Observable<PendingInvestment[]> {
    return this.http.get<PendingInvestment[]>(
      `${this.apiUrl}/get-pending-investments`
    )
  }

  approveInvestment(investmentId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.apiUrl}/approve-investment/${investmentId}`,
      {}
    )
  }

  rejectInvestment(investmentId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.apiUrl}/reject-investment/${investmentId}`,
      {}
    )
  }

  getPropertiesCount(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/properties-count`)
  }

  getCustomersCount(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/customers-count`)
  }
}
