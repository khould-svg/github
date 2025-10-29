import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs'

import { AuthenticationService } from './auth.service'
import { CustomerType } from '@views/customers/data'

interface CustomersResponse {
  customers?: CustomerType[]
  users?: CustomerType[]
  data?: CustomerType[]
  result?: CustomerType[]
}

interface SingleCustomerResponse {
  customer?: CustomerType
  user?: CustomerType
  data?: CustomerType
}
interface CustomerStatsResponse {
  users?: number | string;
  pendingUsers?: number | string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private baseUrl = 'http://localhost:3000'
  private customersSource = new BehaviorSubject<CustomerType[]>([])
  customers$ = this.customersSource.asObservable()

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  private get headers() {
    return { Authorization: this.authService.session || '' }
  }

  getAllCustomers(): Observable<CustomerType[]> {
    return this.http
      .get<CustomersResponse | CustomerType[]>(`${this.baseUrl}/user/users`, {
        headers: this.headers,
      })
      .pipe(map((res) => this.normalizeCustomersResponse(res)))
  }

  getOneCustomer(id: string): Observable<CustomerType> {
    return this.http
      .get<SingleCustomerResponse | CustomerType>(
        `${this.baseUrl}/user/users/${id}`,
        { headers: this.headers }
      )
      .pipe(map((res) => this.normalizeSingleCustomerResponse(res)))
  }
  
  getCustomerStats(): Observable<{ users: number; pendingUsers: number }> {
  return this.http
    .get<CustomerStatsResponse>(`${this.baseUrl}/register/stats`, {
      headers: this.headers,
    })
    .pipe(
      map((res) => ({
        users: Number(res.users) || 0,
        pendingUsers: Number(res.pendingUsers) || 0,
      })),
      catchError((err) => {
        console.error('Error fetching customer stats:', err);
        return of({ users: 0, pendingUsers: 0 });
      })
    );
}
  updateCustomer(
    id: string,
    data: Partial<CustomerType>
  ): Observable<CustomerType> {
    return this.http.put<CustomerType>(
      `${this.baseUrl}/user/update-user/${id}`,
      data,
      { headers: this.headers }
    )
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/delete-user/${id}`, {
      headers: this.headers,
    })
  }

  updateStatus(id: string, status: string): Observable<CustomerType> {
    return this.http.put<CustomerType>(
      `${this.baseUrl}/user/update-status/${id}`,
      { status },
      { headers: this.headers }
    )
  }

  searchCustomers(query: string): Observable<CustomerType[]> {
    return this.http
      .get<CustomersResponse | CustomerType[]>(
        `${this.baseUrl}/user/search?q=${query}`,
        { headers: this.headers }
      )
      .pipe(map((res) => this.normalizeCustomersResponse(res)))
  }

  getFilteredCustomers(filters: {
    q?: string
    status?: string
    type?: string
  }): Observable<CustomerType[]> {
    const params: Record<string, string> = {}
    if (filters.q) params['q'] = filters.q
    if (filters.status) params['status'] = filters.status
    if (filters.type) params['type'] = filters.type

    return this.http
      .get<CustomersResponse | CustomerType[]>(`${this.baseUrl}/user/filter`, {
        headers: this.headers,
        params,
      })
      .pipe(map((res) => this.normalizeCustomersResponse(res)))
  }

  setCustomers(customers: CustomerType[]) {
    this.customersSource.next(customers)
  }

  private normalizeCustomersResponse(
    res: CustomersResponse | CustomerType[]
  ): CustomerType[] {
    const list: CustomerType[] = Array.isArray(res)
      ? res
      : res.customers ?? res.users ?? res.data ?? res.result ?? []

    if (!Array.isArray(list)) return []
    return list.map((it) => this.toCustomer(it))
  }

  private normalizeSingleCustomerResponse(
    res: SingleCustomerResponse | CustomerType
  ): CustomerType {
    const obj =
      (res as SingleCustomerResponse).customer ??
      (res as SingleCustomerResponse).user ??
      (res as SingleCustomerResponse).data ??
      (res as CustomerType)

    return this.toCustomer(obj)
  }

  private toCustomer(obj: CustomerType | null | undefined): CustomerType {
    if (!obj) {
      return {
        id: '',
        name: '',
        image: '',
        email: '',
        phone: '',
        type: '',
        address: '',
        customerStatus: '',
        date: '',
        status: '',
        propertyView: 0,
        propertyOwn: 0,
        invest: '',
      }
    }
    const id = obj.id ?? obj._id ?? ''
    return {
      id: String(id),
      name: obj.name ?? obj.fullName ?? obj.username ?? '',
      image: obj.image ?? obj.avatar ?? '',
      email: obj.email ?? '',
      phone: obj.phone ?? obj.mobile ?? '',
      type: obj.type ?? obj.customerType ?? '',
      address: obj.address ?? '',
      customerStatus: obj.customerStatus ?? obj.statusText ?? obj.status ?? '',
      date: obj.date ?? obj.createdAt ?? obj.updatedAt ?? '',
      status: obj.status ?? '',
      propertyView: obj.propertyView ?? 0,
      propertyOwn: obj.propertyOwn ?? 0,
      invest: obj.invest ?? obj.investment ?? '',
    }
  }
}
