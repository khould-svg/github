import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DashboardService } from '@core/services/dashboard.service'
import type { InvestmentStatType } from '../../data'

interface InvestmentsSummary {
  totalInvestments: number
  activeInvestments: number
  pendingInvestments: number
  totalInvestedAmount: number | null | undefined
}

@Component({
  selector: 'investment-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-state.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InvestmentStateComponent implements OnInit {
  stateList: InvestmentStatType[] = []

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getInvestmentsSummary().subscribe({
      next: (data: InvestmentsSummary) => {
        this.stateList = [
          {
            title: 'Total Investments',
            amount: `${data.totalInvestments}`,
            icon: 'mdi:finance',
            variant: 'primary',
            change: 0,
          },
          {
            title: 'Active Investments',
            amount: `${data.activeInvestments}`,
            icon: 'mdi:chart-line',
            variant: 'success',
            change: 0,
          },
          {
            title: 'Pending Investments',
            amount: `${data.pendingInvestments}`,
            icon: 'mdi:timer-sand',
            variant: 'warning',
            change: 0,
          },
          {
            title: 'Total Amount',
            amount:
              data.totalInvestedAmount != null
                ? `$${data.totalInvestedAmount}`
                : '$0',
            icon: 'mdi:cash',
            variant: 'info',
            change: 0,
          },
        ]
      },
      error: (err: unknown) => {
        console.error('Error fetching investments summary', err)
      },
    })
  }
}
