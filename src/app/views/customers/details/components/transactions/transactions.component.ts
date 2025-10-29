import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { CustomerService } from '@core/services/customer.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'customer-transactions',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, TranslateModule],
  template: `
    <div class="card">
      <div class="card-body">
        <div class="mb-3" *ngIf="ibanImageUrl">
          <h6 class="mb-2">{{ 'CUSTOMER_DETAILS.IBAN_DOCUMENT' | translate }}</h6>
          <img [src]="ibanImageUrl" alt="IBAN Document" class="img-fluid rounded border" (error)="onImageError()" />
      </div>

        <div class="mb-2">
          <strong>{{ 'CUSTOMER_DETAILS.WALLET_ID' | translate }}:</strong>
          <span class="ms-1">{{ walletId || '—' }}</span>
      </div>

        <div class="mb-2" *ngIf="ibanNumber">
          <strong>{{ 'CUSTOMER_DETAILS.IBAN' | translate }}:</strong>
          <span class="ms-1">{{ ibanNumber }}</span>
      </div>

        <h5 class="mb-3">{{ 'CUSTOMER_DETAILS.TRANSACTIONS' | translate }}</h5>

        <div *ngIf="isLoading">{{ 'CUSTOMER_DETAILS.LOADING_TRANSACTIONS' | translate }}...</div>
        <div *ngIf="!isLoading && errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

        <ng-container *ngIf="!isLoading && !errorMessage">
          <div *ngIf="displayedTransactions.length; else noTransactions">
            <div class="transaction-item p-2 border rounded mb-2" *ngFor="let txn of displayedTransactions; trackBy: trackByFn">
              <div class="d-flex justify-content-between align-items-center">
                <div class="fw-semibold text-capitalize">{{ txn.type || 'unknown' }}</div>
                <div [class.text-success]="isCredit(txn.type)" [class.text-danger]="!isCredit(txn.type)">
                  {{ isCredit(txn.type) ? '+' : '-' }}{{ txn.amount | currency:(txn.currency || 'SAR') }}
            </div>
            </div>
              <div class="text-muted small">{{ txn.createdAt | date:'medium' }}</div>
              <div class="small" *ngIf="txn.status">{{ 'CUSTOMER_DETAILS.STATUS' | translate }}: {{ txn.status }}</div>
            </div>

            <div *ngIf="transactions.length > maxDisplay" class="mt-2 text-center">
              <a class="btn btn-sm btn-link" (click)="toggleViewMore()">{{ showAll ? ('CUSTOMER_DETAILS.VIEW_LESS' | translate) : ('CUSTOMER_DETAILS.VIEW_MORE' | translate) }}</a>
            </div>
          </div>
          <ng-template #noTransactions>
            <div class="text-muted">{{ 'CUSTOMER_DETAILS.NO_TRANSACTIONS_FOUND' | translate }}</div>
          </ng-template>
        </ng-container>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId!: string;
  @Input() ibanImageUrl?: string;
  @Input() ibanNumber?: string;
  @Input() walletId?: string;

  transactions: any[] = [];
  displayedTransactions: any[] = [];
  isLoading = false;
  errorMessage = '';
  private subscription?: Subscription;
  maxDisplay = 3;
  showAll = false;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    console.log('TransactionsComponent initialized with userId:', this.userId);
    if (this.userId) {
      if (!this.walletId) {
        this.customerService.getWalletByUserId(this.userId).subscribe({
          next: (wallet: any) => {
            if (wallet) {
              this.walletId = wallet?._id || wallet?.id || wallet?.walletId || this.walletId;
            }
          },
          error: () => {}
        });
      }
      this.loadTransactions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      console.log('userId changed from', changes['userId'].previousValue, 'to', changes['userId'].currentValue);
      if (changes['userId'].currentValue) {
        if (!this.walletId) {
          this.customerService.getWalletByUserId(this.userId).subscribe({
            next: (wallet: any) => {
              if (wallet) {
                this.walletId = wallet?._id || wallet?.id || wallet?.walletId || this.walletId;
              }
            },
            error: () => {}
          });
        }
        this.loadTransactions();
      } else {
        this.clearTransactions();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadTransactions(): void {
    if (!this.userId) {
      console.warn('No userId provided to TransactionsComponent');
      this.errorMessage = 'User ID is required to load transactions';
      return;
    }

    console.log('Loading transactions for userId:', this.userId);
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.transactions = [];

    this.subscription = this.customerService.getUserTransactions(this.userId).subscribe({
      next: (transactions: any[]) => {
        console.log('Transactions loaded successfully:', transactions);
        this.transactions = transactions || [];
        this.displayedTransactions = this.showAll ? this.transactions : this.transactions.slice(0, this.maxDisplay);
        if (!this.walletId) {
          const fromTxn = this.transactions.find(t => !!(t?.walletId || t?.wallet?.id || t?.wallet?._id));
          if (fromTxn) {
            this.walletId = fromTxn.walletId || fromTxn.wallet?.id || fromTxn.wallet?._id || this.walletId;
          }
        }
        this.isLoading = false;
        
        if (this.transactions.length === 0) {
          console.log('ℹ No transactions found for user:', this.userId);
        } else {
          console.log(`Found ${this.transactions.length} transactions`);
        }
      },
      error: (error: any) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = `Failed to load transactions: ${error.message || 'Unknown error'}`;
        this.isLoading = false;
        this.transactions = [];
        
        if (error.status === 401) {
          this.errorMessage = 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. Admin permissions required.';
        } else if (error.status === 404) {
          this.errorMessage = 'Transactions endpoint not found.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your connection.';
        }
      }
    });
  }

  private clearTransactions(): void {
    this.transactions = [];
    this.errorMessage = '';
    this.isLoading = false;
  }

  retryLoad(): void {
    this.loadTransactions();
  }

  trackByFn(index: number, item: any): any {
    return item._id || item.id || index;
  }

  isCredit(type: string): boolean {
    const normalized = (type || '').toLowerCase();
    return normalized === 'deposit' || normalized === 'credit' || normalized === 'dividend';
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#d4edda';
      case 'pending':
        return '#fff3cd';
      case 'failed':
      case 'cancelled':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#155724';
      case 'pending':
        return '#856404';
      case 'failed':
      case 'cancelled':
        return '#721c24';
      default:
        return '#383d41';
    }
  }

  onImageError(): void {
    console.warn('Failed to load IBAN image');
  }

  public refreshTransactions(): void {
    this.loadTransactions();
  }

  toggleViewMore(): void {
    this.showAll = !this.showAll;
    this.displayedTransactions = this.showAll ? this.transactions : this.transactions.slice(0, this.maxDisplay);
  }
}