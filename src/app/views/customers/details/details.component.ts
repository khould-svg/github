import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms'
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  takeUntil,
  tap,
  catchError,
} from 'rxjs'
import { CustomerService, Customer } from '@core/services/customer.service' 
import { CustomerInfoComponent } from './components/customer-info/customer-info.component'
import { PageTitleComponent } from '@component/page-title.component'
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component'
import { TransactionsComponent } from './components/transactions/transactions.component'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CustomerInfoComponent,
    TransactionHistoryComponent,
    TransactionsComponent,
    TranslateModule,
  ],
  templateUrl: './details.component.html',
  styles: ``,
})
export class DetailsComponent implements OnInit, OnDestroy {
  customer: Customer | null = null
  editMode = false
  customerForm!: FormGroup

  searchControl = new FormControl('')
  filteredCustomers: Customer[] = []
  searching = false

  loading = false
  saving = false
  error: string | null = null
  saveError: string | null = null

  roleOptions: string[] = ['user', 'admin', 'agent', 'moderator']
  statusOptions: string[] = ['pending', 'active', 'suspended', 'confirmed']

  private destroy$ = new Subject<void>()

  currentLang: 'en' | 'ar' = 'en'

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id')
      if (id) this.fetchById(id)
    })

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => (this.searching = true)),
        switchMap((q) => {
          const query = (q || '').toString().trim()
          if (!query) {
            this.searching = false
            return of([])
          }
          return this.customerService.searchUsers(query).pipe(
            catchError(() => of([])),
            tap(() => (this.searching = false))
          )
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((users) => (this.filteredCustomers = users || []))
  }

  fetchById(id: string) {
    this.loading = true
    this.error = null
    this.customerService.getCustomerById(id).subscribe({
      next: (u) => {
        this.customer = u
        this.initForm()
        this.loading = false
      },
      error: () => {
        this.error = 'Failed to load customer.'
        this.loading = false
      },
    })
  }

  initForm() {
    const nameValue =
      typeof this.customer?.name === 'string'
        ? this.customer?.name
        : this.customer?.name?.[this.currentLang] || ''

    this.customerForm = this.fb.group({
      name: [nameValue, [Validators.required, Validators.minLength(2)]],
      email: [
        this.customer?.email || '',
        [Validators.required, Validators.email],
      ],
      phone: [this.customer?.mobile || ''],
      country: [this.customer?.country || '', Validators.required],
      status: [this.customer?.status || '', Validators.required],
      role: [this.customer?.customerType || '', Validators.required],
    })
  }

  enableEdit() {
    this.editMode = true
  }

  saveChanges() {
    const id = this.customer?._id || this.customer?.id
    if (!id || !this.customerForm.valid) return
    this.saving = true
    this.saveError = null

    const payload: Partial<Customer> = {
      ...this.customerForm.value,
      name: {
        ...(typeof this.customer?.name === 'object' ? this.customer.name : {}),
        [this.currentLang]: this.customerForm.value.name,
      },
    }

    this.customerService.updateCustomer(id, payload).subscribe({
      next: (res) => {
        if (res) {
          this.customer = res 
        }
        this.editMode = false
        this.saving = false
      },
      error: () => {
        this.saveError = 'Failed to save changes.'
        this.saving = false
      },
    })
  }

  selectSuggestion(u: Customer) {
    const id = u?._id || u?.id
    if (!id) return
    this.router.navigate(['/customers/details', id])
  }

  switchLang(lang: 'en' | 'ar') {
    this.currentLang = lang
    this.initForm()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
