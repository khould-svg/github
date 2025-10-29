import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, map, Observable, catchError, of } from 'rxjs'
import { AuthenticationService } from './auth.service'

export interface CustomerName {
  en?: string
  ar?: string
}

export interface Customer {
  _id: string
  id?: string
  fullName?: CustomerName | string
  username?: string | CustomerName
  email?: string
  mobile?: string
  avatar?: string
  customerType?: string
  status?: string
  statusText?: string
  createdAt?: string
  updatedAt?: string
  investment?: string
  name?: CustomerName
  country?: string
  ibanImageUrl?: string
  iban?: string
  walletId?: string
  wallet?: Wallet
  phone: string
  date: string
  customerStatus: string
}

export interface Transaction {
  _id: string
  type: string
  amount: number
  status: string
  createdAt: string
  updatedAt?: string
}

export interface Wallet {
  _id: string
  id?: string
  userId: string
  balance: number
  currency: string
  createdAt?: string
  updatedAt?: string
}

export interface Investment {
  _id: string
  investorId: string
  amount: number
  propertyId: string
  status: string
  createdAt: string
}

interface UsersResponse {
  users?: Customer[]
}

interface UserResponse {
  user: Customer
}

interface TransactionsResponse {
  transactions?: Transaction[]
  data?: Transaction[]
}

interface WalletResponse {
  wallet?: Wallet
}

interface InvestmentsResponse {
  data?: Investment[]
}

interface PropertyStatsResponse {
  totalProperties: number
  availableProperties: number
  soldProperties: number
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl = 'http://localhost:3000'

  private customersSource = new BehaviorSubject<Customer[]>([])
  public customers$ = this.customersSource.asObservable()

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  private get headers(): { [header: string]: string } {
    const token = this.authService.session
    return token
      ? { Authorization: token, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' }
  }

  private normalizeName(user: Customer): Customer {
    if (!user) return user
    return {
      ...user,
      fullName: user.fullName || user.name?.en || user.name?.ar || '',
    }
  }

  getAllCustomers(): Observable<Customer[]> {
    return this.http
      .get<UsersResponse | Customer[]>(`${this.baseUrl}/user/users`, {
        headers: this.headers,
      })
      .pipe(
        map((response) => {
          let customers: Customer[] = []
          if (!Array.isArray(response) && response.users) {
            customers = response.users
          } else if (Array.isArray(response)) {
            customers = response
          }
          const normalized = customers.map((c) => this.normalizeName(c))
          this.customersSource.next(normalized)
          return normalized
        }),
        catchError(() => {
          this.customersSource.next([])
          return of([])
        })
      )
  }

  getCustomerById(id: string): Observable<Customer | null> {
    return this.http
      .get<UserResponse | Customer>(`${this.baseUrl}/user/user/${id}`, {
        headers: this.headers,
      })
      .pipe(
        map((res) => {
          const u = (res as UserResponse).user ?? (res as Customer)
          return this.normalizeName(u)
        }),
        catchError(() => of(null))
      )
  }

  updateCustomer(
    id: string,
    payload: Partial<Customer>
  ): Observable<Customer | null> {
    return this.http
      .put<UserResponse>(`${this.baseUrl}/user/update-user/${id}`, payload, {
        headers: this.headers,
      })
      .pipe(
        map((response) => {
          const updated = this.normalizeName(response.user)
          const updatedCustomers = this.customersSource.value.map((c) =>
            c._id === id ? { ...c, ...updated } : c
          )
          this.customersSource.next(updatedCustomers)
          return updated
        }),
        catchError(() => of(null))
      )
  }

  deleteCustomer(id: string): Observable<boolean> {
    return this.http
      .delete(`${this.baseUrl}/user/delete-user/${id}`, {
        headers: this.headers,
      })
      .pipe(
        map(() => {
          const filtered = this.customersSource.value.filter(
            (c) => c._id !== id
          )
          this.customersSource.next(filtered)
          return true
        }),
        catchError(() => of(false))
      )
  }

  updateUserStatus(id: string, status: string): Observable<boolean> {
    return this.http
      .put<UserResponse>(
        `${this.baseUrl}/user/user-status/${id}`,
        { status },
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((response) => {
          const updated = this.normalizeName(response.user)
          const updatedCustomers = this.customersSource.value.map((c) =>
            c._id === id ? { ...c, status: updated.status ?? status } : c
          )
          this.customersSource.next(updatedCustomers)
          return true
        }),
        catchError(() => of(false))
      )
  }

  searchUsers(query: string): Observable<Customer[]> {
    const q = encodeURIComponent(query)
    return this.http
      .get<UsersResponse | Customer[]>(
        `${this.baseUrl}/user/users?search=${q}`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((res) => {
          const users: Customer[] = Array.isArray(res) ? res : res.users ?? []
          return users.map((u) => this.normalizeName(u))
        }),
        catchError(() => of([]))
      )
  }

  getUserTransactions(userId: string): Observable<Transaction[]> {
    if (!userId) return of([])
    return this.http
      .get<TransactionsResponse | Transaction[]>(
        `${this.baseUrl}/dashboard/get-all-transactions-user/${userId}`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map((response) => {
          if (Array.isArray(response)) return response
          if (response.transactions) return response.transactions
          if (response.data) return response.data
          return []
        }),
        catchError(() => of([]))
      )
  }

  getWalletByUserId(userId: string): Observable<Wallet | null> {
    if (!userId) return of(null)
    return this.http
      .get<WalletResponse>(`${this.baseUrl}/wallet/my-wallet`, {
        headers: this.headers,
        params: { userId },
      })
      .pipe(
        map((res) => res.wallet ?? null),
        catchError(() => of(null))
      )
  }

  getInvestmentsByUserId(userId: string): Observable<Investment[]> {
    if (!userId) return of([])
    return this.http
      .get<InvestmentsResponse>(`${this.baseUrl}/investment/my-investments`, {
        headers: this.headers,
        params: { investorId: userId },
      })
      .pipe(
        map((res) => res.data ?? []),
        catchError(() => of([]))
      )
  }

  getPropertyStats(): Observable<{
    totalProperties: number
    availableProperties: number
    soldProperties: number
  }> {
    return this.http
      .get<PropertyStatsResponse>(`${this.baseUrl}/realestate/stats`, {
        headers: this.headers,
      })
      .pipe(
        map((res) => ({
          totalProperties: Number(res.totalProperties) || 0,
          availableProperties: Number(res.availableProperties) || 0,
          soldProperties: Number(res.soldProperties) || 0,
        })),
        catchError(() =>
          of({ totalProperties: 0, availableProperties: 0, soldProperties: 0 })
        )
      )
  }

  refreshCustomers(): void {
    this.getAllCustomers().subscribe()
  }

  getCurrentCustomers(): Customer[] {
    return this.customersSource.value
  }

  isAuthenticated(): boolean {
    return !!this.authService.session
  }
}
