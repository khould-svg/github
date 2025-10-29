import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'
import { Observable, tap } from 'rxjs'

export interface CustomerFiles {
  nationalIdImageUrl?: File
  ibanImageUrl?: File
  profileImage?: File
}

export interface CustomerData {
  [key: string]:
    | string
    | number
    | boolean
    | Record<string, string | number | boolean>
}

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private apiUrl = 'http://localhost:3000/register/add'

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('LAhomes_AUTH_SESSION_KEY')

    if (!token) {
      console.warn(
        'No token found in localStorage (LAhomes_AUTH_SESSION_KEY). Admin route may fail.'
      )
      return new HttpHeaders()
    }

    return new HttpHeaders({
      Authorization: token,
    })
  }

  addCustomer(
    customerData: CustomerData,
    files: CustomerFiles
  ): Observable<HttpResponse<unknown>> {
    const formData = new FormData()

    for (const key in customerData) {
      if (customerData.hasOwnProperty(key)) {
        const value = customerData[key]
        if (typeof value === 'object' && value !== null) {
          for (const subKey in value) {
            if (value.hasOwnProperty(subKey)) {
              formData.append(`name[${subKey}]`, String(value[subKey]))
            }
          }
        } else {
          formData.append(key, String(value))
        }
      }
    }

    if (files.nationalIdImageUrl) {
      formData.append('nationalIdImageUrl', files.nationalIdImageUrl)
    }
    if (files.ibanImageUrl) {
      formData.append('ibanImageUrl', files.ibanImageUrl)
    }
    if (files.profileImage) {
      formData.append('profileImage', files.profileImage)
    }

    return this.http
      .post<unknown>(this.apiUrl, formData, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(
        tap({
          next: (res) => console.log('/register/add response:', res),
          error: (err) => console.error('/register/add error:', err),
        })
      )
  }
}
