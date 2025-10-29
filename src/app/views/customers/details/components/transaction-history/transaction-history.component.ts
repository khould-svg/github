import { Component, Input, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common'
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap'
import { CustomerService } from '@core/services/customer.service'
import { Subscription } from 'rxjs'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'customer-transaction-history',
  standalone: true,
  imports: [NgbPaginationModule, NgbDropdownModule, CommonModule, DatePipe, CurrencyPipe, TranslateModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h4 class="card-title">{{ 'CUSTOMER_DETAILS.TRANSACTION_HISTORY' | translate }}</h4>
        </div>
        <div ngbDropdown>
          <a ngbDropdownToggle class="btn btn-sm btn-outline-light rounded" role="button">
            {{ currentFilter === 'all' ? ('CUSTOMER_DETAILS.ALL_TIME' | translate) : currentFilter === 'month' ? ('CUSTOMER_DETAILS.THIS_MONTH' | translate) : currentFilter === 'last3' ? ('CUSTOMER_DETAILS.LAST_3_MONTHS' | translate) : ('CUSTOMER_DETAILS.LAST_12_MONTHS' | translate) }}
          </a>
          <div ngbDropdownMenu class="dropdown-menu-end">
            <a href="javascript:void(0);" class="dropdown-item" (click)="currentFilter='all'; applyFilter()">{{ 'CUSTOMER_DETAILS.ALL_TIME' | translate }}</a>
            <a href="javascript:void(0);" class="dropdown-item" (click)="currentFilter='month'; applyFilter()">{{ 'CUSTOMER_DETAILS.THIS_MONTH' | translate }}</a>
            <a href="javascript:void(0);" class="dropdown-item" (click)="currentFilter='last3'; applyFilter()">{{ 'CUSTOMER_DETAILS.LAST_3_MONTHS' | translate }}</a>
            <a href="javascript:void(0);" class="dropdown-item" (click)="currentFilter='last12'; applyFilter()">{{ 'CUSTOMER_DETAILS.LAST_12_MONTHS' | translate }}</a>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle text-nowrap table-hover table-centered mb-0">
            <thead class="bg-light-subtle">
              <tr>
                <th style="width: 20px">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="customCheck1" />
                    <label class="form-check-label" for="customCheck1"></label>
                  </div>
                </th>
                <!-- <th>{{ 'CUSTOMER_DETAILS.ORDER_ID' | translate }}</th> -->
                <th>{{ 'CUSTOMER_DETAILS.TRANSACTION_DATE' | translate }}</th>
                <th>{{ 'CUSTOMER_DETAILS.PROPERTY_TYPE' | translate }}</th>
                <!-- <th>{{ 'CUSTOMER_DETAILS.PROPERTIES_ADDRESS' | translate }}</th> -->
                <th>{{ 'CUSTOMER_DETAILS.AMOUNT' | translate }}</th>
                <th>{{ 'CUSTOMER_DETAILS.STATUS' | translate }}</th>
                <!-- <th>{{ 'CUSTOMER_DETAILS.AGENT_NAME' | translate }}</th> -->
                <!-- <th>{{ 'CUSTOMER_DETAILS.ACTION' | translate }}</th> -->
              </tr>
            </thead>
            <tbody *ngIf="!isLoading && !errorMessage; else loadingOrError">
              <tr *ngFor="let item of transactionList; trackBy: trackByIndex; let i = index">
                <td>
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="customCheck_{{ i }}" />
                    <label class="form-check-label" for="customCheck_{{ i }}">&nbsp;</label>
                  </div>
                </td>
                <!-- <td>{{ item.order_id }}</td> -->
                <td>{{ item.date | date:'medium' }}</td>
                <td>{{ item.type | titlecase }}</td>
                <!-- <td>{{ item.address }}</td> -->
                <td>{{ item.amount | currency:item.currency }}</td>
                <td>
                  <span class="badge" [ngClass]="{ 'bg-success': item.status === 'completed' || item.status === 'success', 'bg-warning': item.status === 'pending', 'bg-danger': item.status === 'failed' || item.status === 'cancelled' }">{{ item.status }}</span>
                </td>
                <!-- <td>{{ item.customer }}</td> -->
                <!-- <td>
                  <div class="d-flex gap-2">
                    <a href="javascript:void(0);" class="btn btn-light btn-sm">
                      <iconify-icon icon="solar:eye-broken" class="align-middle fs-18"></iconify-icon>
                    </a>
                    <a href="javascript:void(0);" class="btn btn-soft-primary btn-sm">
                      <iconify-icon icon="solar:pen-2-broken" class="align-middle fs-18"></iconify-icon>
                    </a>
                    <a href="javascript:void(0);" class="btn btn-soft-danger btn-sm">
                      <iconify-icon icon="solar:trash-bin-minimalistic-2-broken" class="align-middle fs-18"></iconify-icon>
                    </a>
                  </div>
                </td> -->
              </tr>
            </tbody>
            <ng-template #loadingOrError>
              <tr>
                <td colspan="9" class="text-center py-3">
                  <ng-container *ngIf="isLoading">{{ 'CUSTOMER_DETAILS.LOADING_TRANSACTION_HISTORY' | translate }}...</ng-container>
                  <ng-container *ngIf="!isLoading && errorMessage">{{ errorMessage }}</ng-container>
                  <ng-container *ngIf="!isLoading && !errorMessage && transactionList.length === 0">{{ 'CUSTOMER_DETAILS.NO_TRANSACTION_HISTORY_FOUND' | translate }}</ng-container>
                </td>
              </tr>
            </ng-template>
          </table>
        </div>
      </div>
      <div class="card-footer">
        <nav [attr.aria-label]="'COMMON.PAGE_NAVIGATION' | translate">
          <ngb-pagination [collectionSize]="transactionList.length" [page]="1" class="pagination justify-content-end mb-0">
            <ng-template ngbPaginationPrevious>{{ 'COMMON.PREVIOUS' | translate }}</ng-template>
            <ng-template ngbPaginationNext>{{ 'COMMON.NEXT' | translate }}</ng-template>
          </ngb-pagination>
        </nav>
      </div>
    </div>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  @Input() userId!: string;

  transactionList: any[] = [];
  allTransactions: any[] = [];
  isLoading = false;
  errorMessage = '';
  private subscription?: Subscription;
  currentFilter: 'all' | 'month' | 'last3' | 'last12' = 'all';

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    if (this.userId) this.loadTransactions();
  }

  ngOnChanges(): void {
    if (this.userId) {
      this.loadTransactions();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadTransactions(): void {
    if (!this.userId) {
      this.errorMessage = 'User ID is required to load transactions';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.transactionList = [];

    this.subscription = this.customerService.getUserTransactions(this.userId).subscribe({
      next: (transactions: any[]) => {
        const mapped = (transactions || []).map((t: any) => {
          const date = this.parseDateFlexible(t.createdAt ?? t.date ?? t.transactionDate);
          const typeRaw = (t.type ?? '').toString();
          const type = typeRaw || '-';

          const prop = t.property ?? t.realestate ?? t.asset ?? t.prop ?? t.propertyInfo ?? t.propertyDetails ?? {};
          const cityRegionCountry = [prop.city, prop.region, prop.country].filter(Boolean).join(', ');
          const resolvedAddress = (
            prop.address?.full ?? prop.location?.full ?? prop.fullAddress ??
            prop.addressLine ?? prop.address1 ?? prop.streetAddress ??
            prop.address ?? prop.location ?? (cityRegionCountry || null) ??
            t.propertyAddress ?? t.property_address ?? t.propertyLocation ?? t.location ?? t.address ??
            t.referenceId ?? '-'
          );
          const isDeposit = typeRaw.toLowerCase() === 'deposit';
          const address = isDeposit ? '-' : resolvedAddress;

          const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
          const currency = t.currency || 'SAR';

          const customer = (
            t.userId?.name?.en || t.userId?.name?.ar || t.userId?.name ||
            t.userName || t.customerName || t.userId?.email || t.userEmail || '-'
          );
          const status = t.status || '-';

          return {
            order_id: t._id || t.id || '-',
            date,
            type,
            address,
            amount,
            status,
            customer,
            currency
          };
        });
        this.allTransactions = mapped;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error(' loading transaction history:', error);
        this.errorMessage = `Failed to load transaction history: ${error.message || 'Unknown error'}`;
        this.isLoading = false;
        this.transactionList = [];
      }
    });
  }

  applyFilter(): void {
    const now = new Date();
    if (this.currentFilter === 'all') {
      this.transactionList = this.allTransactions;
      return;
    }
    const monthsBack = this.currentFilter === 'month' ? 0 : this.currentFilter === 'last3' ? 3 : 12;
    const cutoff = this.currentFilter === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());

    this.transactionList = this.allTransactions.filter((t: any) => {
      const d = t.date instanceof Date ? t.date : this.parseDateFlexible(t.date);
      if (!(d instanceof Date) || isNaN((d as any))) return false;
      return d >= cutoff;
    });
  }

  private parseDateFlexible(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN((value as any)) ? null : value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value !== 'string') return null;

    const native = new Date(value);
    if (!isNaN((native as any))) return native;

    const ddmmyyyy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(.*)$/;
    const m = value.match(ddmmyyyy);
    if (m) {
      const day = m[1], month = m[2], year = m[3];
      const rest = m[4] || '';
      const iso = `${year}-${month}-${day}${rest}`;
      const d2 = new Date(iso);
      if (!isNaN((d2 as any))) return d2;
    }

    const mmddyyyy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(.*)$/;
    const n = value.match(mmddyyyy);
    if (n) {
      const month = n[1], day = n[2], year = n[3];
      const rest = n[4] || '';
      const iso = `${year}-${month}-${day}${rest}`;
      const d3 = new Date(iso);
      if (!isNaN((d3 as any))) return d3;
    }

    return null;
  }

  trackByIndex = (_: number, __: any) => _;

  retryLoad(): void {
    this.loadTransactions();
  }
}
