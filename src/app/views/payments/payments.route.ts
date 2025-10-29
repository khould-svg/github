import { Routes } from '@angular/router'
import { PaymentListComponent } from './payment-list/payment-list.component'
import { PaymentDetailsComponent } from './payment-details/payment-details.component'

export const PAYMENTS_ROUTES: Routes = [
  {
    path: 'list',
    component: PaymentListComponent,
    data: { title: 'Payments' },
  },
]
