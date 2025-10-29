import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  throwError,
  catchError,
} from 'rxjs'
import { AuthenticationService } from './auth.service'

export interface Investment {
  id: string
  propertyId: string
  amount: number
  userId?: string 
  createdAt?: string 
  updatedAt?: string
}

export interface CreateInvestmentDTO {
  propertyId: string
  amount: number
}

export interface PropertyInfo {
  id: string
  name: string
  location: string
  type: string
}

export interface Investment {
  id: string
  propertyId: string
  property?: PropertyInfo
  amountInvested: number
  sharesPurchased: number
  investmentDate: string
  status: 'active' | 'pending' | 'exited' | 'closed' | string
  returns: number
  userId?: string
  createdAt?: string
  updatedAt?: string
}

@Injectable({
  providedIn: 'root',
})
export class InvestmentService {
  private baseUrl = 'http://localhost:3000/investment'
  private investmentsSource = new BehaviorSubject<Investment[]>([])
  investments$ = this.investmentsSource.asObservable()

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}


  getAllInvestments(): Observable<Investment[]> {
    return this.http.get<Investment[]>(`${this.baseUrl}/all`).pipe(
      map((res) => res ?? []),
      catchError((err) => {
        console.error('Error fetching investments:', err)
        return of([])
      })
    )
  }

  getInvestmentById(id: string): Observable<Investment | null> {
    return this.http.get<Investment>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => {
        console.error(`Error fetching investment ${id}:`, err)
        return of(null)
      })
    )
  }

  createInvestment(data: CreateInvestmentDTO): Observable<Investment> {
    if (!this.authService.session) {
      return throwError(() => new Error('User is not authenticated!'))
    }
    return this.http.post<Investment>(`${this.baseUrl}/create`, data).pipe(
      catchError((err) => {
        console.error('Error creating investment:', err)
        return throwError(() => err)
      })
    )
  }

  setInvestments(investments: Investment[]) {
    this.investmentsSource.next(investments)
  }

  refreshInvestments() {
    this.getAllInvestments().subscribe((investments) => {
      this.setInvestments(investments)
    })
  }
}
