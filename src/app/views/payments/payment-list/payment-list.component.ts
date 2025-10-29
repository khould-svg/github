import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { PaymentService } from '@core/services/payment.service'
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { PageTitleComponent } from '@component/page-title.component'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { Payment, PaymentStats } from '@core/services/payment.service' 

interface DisplayPayment {
  id: number
  paymentId: string
  amount: number
  currency: string
  status: string
  customerName: string
  createdAt: string
  method: string
}

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    NgbPagination,
    CommonModule,
    PageTitleComponent,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PaymentListComponent implements OnInit {
  payments: DisplayPayment[] = []
  paginatedPayments: DisplayPayment[] = []
  stats: PaymentStats | null = null
  currency = 'USD'
  page = 1
  pageSize = 10
  collectionSize = 0

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments()
    this.loadStats()
  }

  loadPayments() {
    this.paymentService.getAllPayments().subscribe({
      next: (res) => {
        console.log('Payments:', res)
        this.payments = res.map((p, i) => ({
          id: i + 1,
          paymentId: p.id,
          amount: p.amount,
          currency: p.currency?.toUpperCase() || 'USD',
          status: p.status
            ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
            : 'Unknown',
          customerName: p.customer_name || p.customer_email || 'N/A',
          createdAt: p.created_at,
          method: p.card_info || p.method || 'N/A',
        }))

        this.collectionSize = this.payments.length
        this.refreshPayments()
      },
      error: (err) => console.error(err),
    })
  }

  loadStats() {
    this.paymentService.getStats().subscribe({
      next: (res) => {
        console.log('Stats:', res)
        this.stats = res
      },
      error: (err) => console.error(err),
    })
  }

  refreshPayments() {
    this.paginatedPayments = this.payments
      .map((payment, i) => ({ ...payment, id: i + 1 }))
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      )
  }

  deletePayment(id: string) {
    console.log('Deleting payment with id:', id)
  }
}
