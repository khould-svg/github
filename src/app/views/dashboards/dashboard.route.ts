import type { Route } from '@angular/router'
import { AnalyticsComponent } from './analytics/analytics.component'
import { AgentComponent } from './agent/agent.component'
import { CustomerComponent } from './customer/customer.component'

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    component: AnalyticsComponent,
    data: { title: 'Dashboard' },
  },
  
]
