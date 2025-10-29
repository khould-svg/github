import { Component, OnInit } from '@angular/core'
import type { ChartOptions } from '@common/apexchart.model'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { NgApexchartsModule } from 'ng-apexcharts'
import { TranslateModule } from '@ngx-translate/core'
import { DashboardService } from '@core/services/dashboard.service'
import { currency } from '@common/constants'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'analytics-sales-chart',
  standalone: true,
  imports: [NgApexchartsModule, NgbDropdownModule,CommonModule, TranslateModule],
  templateUrl: './sales-chart.component.html',
  styles: ``,
})
export class SalesChartComponent implements OnInit {
  currency = currency

  constructor(private dashboardService: DashboardService) {}

  investmentsAnalytics: any;
salesAnalyticChart: any = {
  series: [],
  chart: { type: "line", height: 350 },
  labels: [],
  colors: ["#00c853", "#d50000"],
  stroke: { curve: "smooth" }
};

  ngOnInit(): void {
    this.loadAnalytics("month"); 
  }

  loadAnalytics(period: string) {
    this.dashboardService.getInvestmentsAnalytics(period).subscribe({
      next: (data) => {

        console.log("Chart Data:", data.chartData);
        console.log(`Investments Analytics (${period}):`, data);
        this.investmentsAnalytics = data;

   this.salesAnalyticChart = {
  chart: {
    type: "line",
    height: 350,
    toolbar: { show: false }
  },
  series: [
    { name: "Income", data: data.chartData.map((d: any) => d.income) },
    { name: "Expense", data: data.chartData.map((d: any) => d.expense) }
  ],
  xaxis: {
    categories: data.chartData.map((d: any) => d.label), 
  },
  colors: ["#3a5445", "#c8a877"],
  stroke: { curve: "smooth" },
};


      },
      error: (err) => {
        console.error(" Error loading analytics:", err);
      }
    });
  }
}
