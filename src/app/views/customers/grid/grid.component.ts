import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core'
import { PageTitleComponent } from '@component/page-title.component'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { currency } from '@common/constants'
import { RouterModule } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { CustomerService } from '@core/services/customer.service'

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [
    PageTitleComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './grid.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridComponent implements OnInit {
  customers: any[] = []
  filteredCustomers: any[] = []
  currency = currency

  searchText: string = ''
  currentLang = 'en'

  constructor(
    private customerService: CustomerService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'en'
    this.loadCustomers()
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.customers = res
        this.filteredCustomers = [...this.customers]
      },
      error: (err) => {
        console.error('Error fetching customers:', err)
      },
    })
  }

  filterCustomers() {
    const search = this.searchText.toLowerCase().trim()
    this.filteredCustomers = this.customers.filter((c: any) => {
      const name = this.getDisplayName(c)
      return (
        name.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.phone?.toLowerCase().includes(search) ||
        c.country?.toLowerCase().includes(search) ||
        c.status?.toLowerCase().includes(search)
      )
    })
  }

  getDisplayName(customer: any): string {
    if (!customer?.name) return ''
    if (typeof customer.name === 'string') return customer.name
    return (
      customer.name[this.currentLang] ||
      customer.name['en'] ||
      customer.name['ar'] ||
      ''
    )
  }
}
