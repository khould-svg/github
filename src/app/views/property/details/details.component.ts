import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { PropertyInfoComponent } from './components/property-info/property-info.component'
import { PropertyService } from '@core/services/property.service'
import { PropertyCycle } from '@core/services/property.service'
import { Property } from '@core/services/property.service'
import { PropertyResponse } from '@core/services/property.service'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators,
} from '@angular/forms'

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PropertyInfoComponent,
    TranslateModule,
  ],
  templateUrl: './details.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailsComponent implements OnInit {
  property!: Property
  isAdmin: boolean = true
  editMode = false
  propertyForm!: FormGroup

  cycles: PropertyCycle[] = []
  currency: string = 'EGP'

  showCreateCycleForm: boolean = false
  cycleForm!: FormGroup

  editFields = [
    { key: 'name', label: 'Property Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'type', label: 'Property Type', type: 'text' },
    { key: 'totalValue', label: 'Price', type: 'number' },
    { key: 'minInvestment', label: 'Min Investment', type: 'number' },
    {
      key: 'expectedNetYield',
      label: 'Expected Net Yield (%)',
      type: 'number',
    },
    {
      key: 'expectedAnnualReturn',
      label: 'Expected Annual Return (%)',
      type: 'number',
    },
    {
      key: 'holdingPeriodMonths',
      label: 'Holding Period (months)',
      type: 'number',
    },
    { key: 'description', label: 'Description', type: 'textarea' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'available', label: 'Available' },
        { value: 'pending', label: 'Pending' },
        { value: 'sold', label: 'Sold' },
      ],
    },
    {
      key: 'isRented',
      label: 'Rented',
      type: 'select',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    { key: 'currentRent', label: 'Current Rent', type: 'number' },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id')
      if (id) this.loadProperty(id)
    })
    this.initCycleForm()
  }

  private getPropertyId(): string {
    return this.property?._id || this.property?._id || ''
  }

  loadProperty(id: string): void {
    this.propertyService.getOneRealEstate(id).subscribe({
      next: (res: PropertyResponse) => {
        this.property = res.property
        this.initForm()
        this.loadCycles()
      },
      error: (err: unknown) => console.error('Error loading property:', err),
    })
  }

  initForm() {
    this.propertyForm = this.fb.group({
      name: [this.property?.name || ''],
      location: [this.property?.location || ''],
      type: [this.property?.type || ''],
      totalValue: [this.property?.totalValue || 0],
      minInvestment: [this.property?.minInvestment || 0],
      expectedNetYield: [this.property?.expectedNetYield || 0],
      expectedAnnualReturn: [this.property?.expectedAnnualReturn || 0],
      holdingPeriodMonths: [this.property?.holdingPeriodMonths || 0],
      description: [this.property?.description || ''],
      totalShares: [this.property?.totalShares || 0],
      isRented: [this.property?.isRented || false],
      currentRent: [this.property?.currentRent || 0],
      status: [this.property?.status || 'available'],
    })
  }

  enableEdit() {
    this.editMode = true
    this.initForm()
  }

  saveChanges() {
    if (this.propertyForm.valid) {
      this.propertyService
        .updateRealEstate(this.getPropertyId(), this.propertyForm.value)
        .subscribe({
          next: (res: Property) => {
            this.property = res
            this.editMode = false
          },
          error: (err: unknown) => console.error('Error saving changes:', err),
        })
    }
  }

  deleteProperty() {
    this.propertyService.deleteRealEstate(this.getPropertyId()).subscribe({
      next: () => this.router.navigate(['/properties']),
      error: (err: unknown) => console.error('Error deleting property:', err),
    })
  }

  changeStatus(event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value

    if (
      newStatus === 'available' ||
      newStatus === 'pending' ||
      newStatus === 'sold'
    ) {
      this.propertyService
        .updateStatus(this.getPropertyId(), newStatus)
        .subscribe({
          next: (res) => (this.property = res),
          error: (err) => console.error('Error updating status:', err),
        })
    } else {
      console.error('Invalid status value:', newStatus)
    }
  }

  loadCycles() {
    this.propertyService.getPropertyCycles(this.getPropertyId()).subscribe({
      next: (res) => (this.cycles = res || []),
      error: (err) => console.error('Error loading cycles:', err),
    })
  }

  viewCycle(cycleId: string) {
    this.router.navigate(['/cycles', cycleId])
  }

  initCycleForm() {
    this.cycleForm = this.fb.group({
      periodStart: ['', Validators.required],
      periodEnd: ['', Validators.required],
      grossCollected: [0, Validators.min(0)],
      expenses: [0, Validators.min(0)],
      managementFee: [0, Validators.min(0)],
      reserveForCapEx: [0, Validators.min(0)],
      taxes: [0, Validators.min(0)],
      notes: [''],
    })
  }

  submitCycleForm() {
    if (!this.cycleForm.valid) return

    const formValue = this.cycleForm.value
    const payload = {
      ...formValue,
      propertyId: this.getPropertyId(),
      periodStart: new Date(formValue.periodStart),
      periodEnd: new Date(formValue.periodEnd),
    }

    console.log('Submitting cycle payload:', payload) 

    this.propertyService.createPropertyCycle(payload).subscribe({
      next: (res) => {
        this.cycles.push(res)
        this.showCreateCycleForm = false
        this.cycleForm.reset({
          periodStart: '',
          periodEnd: '',
          grossCollected: 0,
          expenses: 0,
          managementFee: 0,
          reserveForCapEx: 0,
          taxes: 0,
          notes: '',
        })
      },
      error: (err) => console.error('Error creating cycle:', err),
    })
  }
}
