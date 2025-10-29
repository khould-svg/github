import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { CustomersService } from '@core/services/user.service'
import { TranslateModule } from '@ngx-translate/core'

interface FileMap {
  [key: string]: File
}

interface CustomerPayload {
  name: { ar: string; en: string }
  nationalId: string
  country: string
  email: string
  phone: string
  password: string
  nafathSub: string
  iban: string
  nationalIdImageUrl: string
  ibanImageUrl: string
  profileImage?: string
  status: string
  role: string
}

@Component({
  selector: 'customer-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './customer-info.component.html',
  styles: [``],
})
export class CustomerInfoComponent implements OnInit {
  customerForm: FormGroup
  debugPayload!: CustomerPayload
  missingFields: string[] = []
  selectedFiles: FileMap = {}

  private readonly requiredFields = [
    'name.ar',
    'nationalId',
    'country',
    'password',
    'phone',
    'email',
    'nationalIdImageUrl',
    'ibanImageUrl',
  ]

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService
  ) {
    this.customerForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      nationalId: ['', [Validators.required, Validators.minLength(10)]],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
      nafathSub: ['', Validators.required],
      iban: ['', [Validators.required, Validators.pattern(/^[0-9]{15,34}$/)]],
      nationalIdImageUrl: ['', Validators.required],
      ibanImageUrl: ['', Validators.required],
      profileImage: ['', Validators.required],
      status: ['pending', Validators.required],
      role: ['user', Validators.required],
    })
  }

  onFileSelected(event: Event, field: keyof FileMap): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only JPG/PNG allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large (max 2MB)')
      return
    }

    this.selectedFiles[field] = file
    this.customerForm.patchValue({ [field]: file.name })
    const control = this.customerForm.get(field as string)
    control?.updateValueAndValidity()
  }

  ngOnInit(): void {
    this.customerForm
      .get('country')
      ?.valueChanges.subscribe((value: string) => {
        const v = (value || '').toLowerCase()
        const passwordControl = this.customerForm.get('password')
        const nafathControl = this.customerForm.get('nafathSub')

        if (v === 'sa' || v === 'saudi arabia') {
          nafathControl?.setValidators([Validators.required])
          passwordControl?.clearValidators()
          passwordControl?.setValue('')
        } else {
          passwordControl?.setValidators([
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
          ])
          nafathControl?.clearValidators()
          nafathControl?.setValue('')
        }

        passwordControl?.updateValueAndValidity({ emitEvent: false })
        nafathControl?.updateValueAndValidity({ emitEvent: false })
      })

    this.customerForm.valueChanges.subscribe(() => this.refreshDebug())
    this.refreshDebug()
  }

  private buildPayload(): CustomerPayload {
    const fv = this.customerForm.value
    return {
      name: { ar: fv.nameAr?.trim() ?? '', en: fv.nameEn?.trim() ?? '' },
      nationalId: fv.nationalId?.trim() ?? '',
      country: fv.country?.trim() ?? '',
      email: fv.email?.trim() ?? '',
      phone: fv.phone?.trim() ?? '',
      password: fv.password ?? '',
      nafathSub: fv.nafathSub ?? '',
      iban: fv.iban?.trim() ?? '',
      nationalIdImageUrl: fv.nationalIdImageUrl?.trim() ?? '',
      ibanImageUrl: fv.ibanImageUrl?.trim() ?? '',
      profileImage: fv.profileImage?.trim() ?? '',
      status: fv.status ?? 'pending',
      role: fv.role ?? 'user',
    }
  }

  private getByPath(obj: object, path: string): string | undefined {
    return path.split('.').reduce<unknown>((o, k) => {
      if (o && typeof o === 'object') {
        const record = o as Record<string, unknown>
        return record[k]
      }
      return undefined
    }, obj) as string | undefined
  }

  private computeMissingFields(payload: CustomerPayload): string[] {
    const isSaudi = ['sa', 'saudi arabia'].includes(
      payload.country.toLowerCase()
    )
    return this.requiredFields.filter((f) => {
      if (f === 'password' && isSaudi) return false
      const val = this.getByPath(payload, f)
      return val === undefined || val === null || String(val).trim() === ''
    })
  }

  private refreshDebug(): void {
    this.debugPayload = this.buildPayload()
    this.missingFields = this.computeMissingFields(this.debugPayload)
    console.log(' Form value:', this.customerForm.value)
    console.log(
      ' Payload preview (JSON):',
      JSON.stringify(this.debugPayload, null, 2)
    )
    console.log(' Missing (client-check):', this.missingFields)
  }

  onSubmit(): void {
    this.refreshDebug()
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched()
      alert(' Please correct validation errors before submitting.')
      return
    }

    const payload: CustomerPayload = this.buildPayload()

    const customerData: Record<
      string,
      string | number | boolean | Record<string, string | number | boolean>
    > = {
      name: { ...payload.name },
      nationalId: payload.nationalId,
      country: payload.country,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      nafathSub: payload.nafathSub,
      iban: payload.iban,
      nationalIdImageUrl: payload.nationalIdImageUrl,
      ibanImageUrl: payload.ibanImageUrl,
      profileImage: payload.profileImage ?? '',
      status: payload.status,
      role: payload.role,
    }

    this.customersService
      .addCustomer(customerData, {
        nationalIdImageUrl: this.selectedFiles['nationalIdImageUrl'],
        ibanImageUrl: this.selectedFiles['ibanImageUrl'],
        profileImage: this.selectedFiles['profileImage'],
      })
      .subscribe({
        next: (res) => {
          console.log(' Created:', res)
          alert('User Created Successfully!')
          this.customerForm.reset()
          this.selectedFiles = {}
          this.refreshDebug()
        },
        error: (err: unknown) => {
          console.error(' Backend error:', err)
          const msg =
            (err as { error?: { message?: string } })?.error?.message ||
            'Failed to create user'
          alert(msg)
        },
      })
  }
}
