import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  throwError,
} from 'rxjs'
import { AuthenticationService } from './auth.service'

export interface Property {
  _id: string
  name: string
  location: string
  country?: string
  type: string
  propertyType?: string
  totalValue: number
  minInvestment: number
  expectedNetYield: number
  expectedAnnualReturn: number
  holdingPeriodMonths: number
  description: string
  totalShares: number
  isRented: boolean
  currentRent: number
  status: 'available' | 'pending' | 'sold'
  images?: string[]
  variant?: string
  icon?: string
  bedrooms?: number
  bathrooms?: number
  size?: number
  features?: string[]
  investors?: { name: string; amount: number }[]
  transactions?: { type: string; status: string; amount: number }[]
  cycles?: { period: string; netProfit: number }[]
}

export interface PropertyCycle {
  _id: string
  property?: Property 
  propertyId?: string 
  periodStart: string
  periodEnd: string
  grossCollected: number
  expenses: number
  managementFee: number
  reserveForCapEx: number
  taxes: number
  netRevenue: number
  totalDistributed: number
  distributions: PropertyCycleDistribution[]
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface PropertyStats {
  totalProperties: number
  availableProperties: number
  soldProperties: number
}

export interface PropertyCycleDistribution {
  investor: string
  investment: string
  sharesAtRecord: number
  sharePercentageAtRecord: number
  amountDistributed: number
  transactionId?: string
}

export interface PropertyFilters {
  q?: string
  minPrice?: number
  maxPrice?: number
  type?: string
  features?: string[]
}

export interface PropertyResponse {
  property: Property
}


@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private baseUrl = 'http://localhost:3000/realestate'
  private cyclesUrl = 'http://localhost:3000/propertycycle'

  private propertiesSource = new BehaviorSubject<Property[]>([])
  properties$ = this.propertiesSource.asObservable()

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  private get headers() {
    return { Authorization: this.authService.session || '' }
  }

  getStats(): Observable<PropertyStats> {
    return this.http.get<PropertyStats>(`${this.baseUrl}/stats`, {
      headers: this.headers,
    })
  }

  getAllRealEstates(): Observable<Property[]> {
    return this.http
      .get<{ properties: Property[] }>(`${this.baseUrl}/all-properties`, {
        headers: this.headers,
      })
      .pipe(
        map((res) => res.properties),
        catchError((err) => {
          console.error('Error fetching properties:', err)
          return of([])
        })
      )
  }

  getOneRealEstate(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.baseUrl}/property/${id}`, {
      headers: this.headers,
    })
  }

  addProperty(formData: FormData): Observable<Property> {
    if (!this.authService.session) {
      return throwError(() => new Error('User is not authenticated!'))
    }

    return this.http.post<Property>(`${this.baseUrl}/add-property`, formData, {
      headers: this.headers,
    })
  }

  updateRealEstate(id: string, data: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(
      `${this.baseUrl}/update-property/${id}`,
      data,
      {
        headers: this.headers,
      }
    )
  }

  updateRealEstateWithImages(
    id: string,
    formData: FormData
  ): Observable<Property> {
    return this.http.put<Property>(
      `${this.baseUrl}/update-property/${id}`,
      formData,
      {
        headers: this.headers,
      }
    )
  }

  deleteRealEstate(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/delete-property/${id}`,
      {
        headers: this.headers,
      }
    )
  }

  updateStatus(
    id: string,
    status: 'available' | 'pending' | 'sold'
  ): Observable<Property> {
    return this.http.put<Property>(
      `${this.baseUrl}/update-status/${id}`,
      { status },
      {
        headers: this.headers,
      }
    )
  }

  searchProperties(query: string): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/search?q=${query}`, {
      headers: this.headers,
    })
  }

  getFilteredProperties(filters: PropertyFilters): Observable<Property[]> {
    let params = new HttpParams()
    if (filters.q) params = params.set('q', filters.q)
    if (filters.minPrice)
      params = params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice)
      params = params.set('maxPrice', filters.maxPrice.toString())
    if (filters.type) params = params.set('type', filters.type)
    if (filters.features?.length)
      params = params.set('features', filters.features.join(','))

    return this.http.get<Property[]>(`${this.baseUrl}/filter`, {
      headers: this.headers,
      params,
    })
  }

  calculateReturns(
    propertyId: string,
    data: Record<string, unknown>
  ): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(
      `${this.baseUrl}/calculate-returns/${propertyId}`,
      data,
      { headers: this.headers }
    )
  }

  updateReturns(
    propertyId: string,
    data: Record<string, unknown>
  ): Observable<Record<string, unknown>> {
    return this.http.put<Record<string, unknown>>(
      `${this.baseUrl}/calculate-returns/${propertyId}`,
      data,
      { headers: this.headers }
    )
  }

  getPropertyCycles(propertyId: string): Observable<PropertyCycle[]> {
    return this.http
      .get<PropertyCycle[]>(`${this.cyclesUrl}/list/${propertyId}`, {
        headers: this.headers,
      })
      .pipe(
        catchError((err) => {
          console.error('Error fetching property cycles:', err)
          return of([])
        })
      )
  }

  getPropertyCycleById(cycleId: string): Observable<PropertyCycle> {
    return this.http.get<PropertyCycle>(`${this.cyclesUrl}/cycle/${cycleId}`, {
      headers: this.headers,
    })
  }

  createPropertyCycle(data: Partial<PropertyCycle>): Observable<PropertyCycle> {
    return this.http.post<PropertyCycle>(`${this.cyclesUrl}/create`, data, {
      headers: this.headers,
    })
  }

  setProperties(properties: Property[]) {
    this.propertiesSource.next(properties)
  }

  refreshProperties() {
    this.getAllRealEstates().subscribe((properties) =>
      this.setProperties(properties)
    )
  }
}
