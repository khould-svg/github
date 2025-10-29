import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { PageTitleComponent } from '@component/page-title.component'
import { CustomerService, Customer } from '@core/services/customer.service'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent, TranslateModule],
  templateUrl: './search.component.html',
  styles: ``,
})
export class SearchComponent {
  query = ''
  filteredCustomers: Customer[] = []

  constructor(
    private router: Router,
    private customerService: CustomerService
  ) {}

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    this.query = value.trim()

    if (this.query.length > 1) {
      this.customerService.searchUsers(this.query).subscribe({
        next: (res) => {
          this.filteredCustomers = res || []
        },
        error: (err) => {
          console.error('Search error:', err)
          this.filteredCustomers = []
        },
      })
    } else {
      this.filteredCustomers = []
    }
  }

  tryNavigateSelected() {
    const selected = this.filteredCustomers.find(
      (c) => this.getCustomerName(c).toLowerCase() === this.query.toLowerCase()
    )
    if (selected) {
      this.router.navigate(['/customers/details', selected._id || selected.id])
    }
  }

  getCustomerName(cust: Customer): string {
    if (!cust || !cust.name) return ''
    return typeof cust.name === 'string'
      ? cust.name
      : cust.name.en || cust.name.ar || ''
  }
}
