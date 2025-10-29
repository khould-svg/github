import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core'
import { PageTitleComponent } from '@component/page-title.component'
import { StatisticsComponent } from './components/statistics/statistics.component'
import { SalesChartComponent } from './components/sales-chart/sales-chart.component'
import { BalanceCardComponent } from './components/balance-card/balance-card.component'
import { WeeklySalesComponent } from './components/weekly-sales/weekly-sales.component'
import {
  DashboardService,
  InvestmentSummary,
  PropertyProgress,
  Transaction,
  Wallet,
  PendingInvestment,
} from '@core/services/dashboard.service'
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    PageTitleComponent,
    StatisticsComponent,
    SalesChartComponent,
    BalanceCardComponent,
    WeeklySalesComponent,
    CommonModule, 
    DatePipe,
    CurrencyPipe,
    TranslateModule,
  ],
  templateUrl: './analytics.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AnalyticsComponent implements OnInit {
  investmentsSummary!: InvestmentSummary
  propertyProgress!: PropertyProgress[]
  transactionsDashboard!: Transaction[]
  walletsDashboard!: Wallet[]
  pendingInvestments: PendingInvestment[] = []
  propertiesCount: number = 0
  customersCount: number = 0
  loading: boolean = true

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard()
  }

  loadDashboard() {
    this.loading = true

    this.dashboardService.getInvestmentsSummary().subscribe((data) => {
      this.investmentsSummary = data
    })

    this.dashboardService.getPropertiesProgress().subscribe((data) => {
      this.propertyProgress = data
    })

    this.dashboardService.getTransactionsDashboard().subscribe((data) => {
      this.transactionsDashboard = data
    })

    this.dashboardService.getWalletsDashboard().subscribe((data) => {
      this.walletsDashboard = data
    })

    this.dashboardService.getPendingInvestments().subscribe((data) => {
      this.pendingInvestments = data 
    })

    this.dashboardService.getPropertiesCount().subscribe((data) => {
      this.propertiesCount = data.count
    })

    this.dashboardService.getCustomersCount().subscribe((data) => {
      this.customersCount = data.count
    })

    setTimeout(() => {
      this.loading = false
    }, 1000)
  }

  approve(inv: PendingInvestment) {
    this.dashboardService.approveInvestment(inv._id).subscribe({
      next: () => {
        alert('Investment approved')
        this.loadDashboard()
      },
      error: (err) => console.error(err),
    })
  }

  reject(inv: PendingInvestment) {
    this.dashboardService.rejectInvestment(inv._id).subscribe({
      next: () => {
        alert('Investment rejected')
        this.loadDashboard()
      },
      error: (err) => console.error(err),
    })
  }
}
