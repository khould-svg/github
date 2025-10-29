import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PropertyService, Property } from '@core/services/property.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'add-information',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './add-information.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddInformationComponent implements OnInit {
  @Output() infoChange = new EventEmitter<Partial<Property>>();
  infoForm!: FormGroup;
  isSubmitting = false;
  noImage = 'assets/images/no-image.png';

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.infoForm.valueChanges.subscribe((val) => {
      this.infoChange.emit(val as Partial<Property>);
    });
  }

  private initializeForm(): void {
    this.infoForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern(/^[a-zA-Z0-9\u0600-\u06FF\s\-_,\.]+$/),
          ],
        ],

        location: [
          '',
          [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(200),
          ],
        ],

        type: ['', Validators.required],
        square: [null, [Validators.min(0), Validators.pattern(/^\d*\.?\d+$/)]],
        numberOfRooms: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]],
        numberOfBathrooms: [
          null,
          [Validators.min(0), Validators.pattern(/^\d+$/)],
        ],
        propertyNumber: ['', Validators.maxLength(20)],

        totalValue: [
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        minInvestment: [
          500,
          [Validators.min(0), Validators.pattern(/^\d*\.?\d+$/)],
        ],

        expectedNetYield: [
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        expectedAnnualReturn: [
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        holdingPeriodMonths: [
          60,
          [Validators.min(1), Validators.pattern(/^\d+$/)],
        ],
        sharePrice: [
          1,
          [Validators.min(0.01), Validators.pattern(/^\d*\.?\d+$/)],
        ],

        totalShares: [
          null,
          [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
        ],

        remainingShares: [null, [Validators.min(0)]],
        investedAmount: [0, [Validators.min(0)]],
        investorCount: [0, [Validators.min(0)]],

        isRented: [false],
        currentRent: [0, [Validators.min(0)]],
        rentDistributionFrequency: ['quarterly'],
        lastDividendDate: [null],
        previousValue: [
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        newValue: [
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        changePercent: [null],
        valuationDate: [new Date()],
        source: ['', Validators.maxLength(100)],

        acquisitionFeePercent: [
          1.5,
          [
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        annualAdminFeePercent: [
          0.5,
          [
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        exitFeePercent: [
          2.5,
          [
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        performanceFeePercent: [
          7.0,
          [
            Validators.min(0),
            Validators.max(100),
            Validators.pattern(/^\d*\.?\d+$/),
          ],
        ],

        description: ['', Validators.maxLength(1000)],
        features: this.fb.array([]),
        images: this.fb.array(
          [],
          [Validators.required, Validators.minLength(1)]
        ),

        coordinates: this.fb.group({
          latitude: [
            null,
            [
              Validators.min(-90),
              Validators.max(90),
              Validators.pattern(/^-?\d*\.?\d+$/),
            ],
          ],
          longitude: [
            null,
            [
              Validators.min(-180),
              Validators.max(180),
              Validators.pattern(/^-?\d*\.?\d+$/),
            ],
          ],
        }),

        countryCode: ['SA', Validators.pattern(/^[A-Z]{2}$/)],

        tenantInfo: this.fb.group({
          name: ['', Validators.maxLength(100)],
          leaseStartDate: [null],
          leaseEndDate: [null],
          monthlyRent: [null, [Validators.min(0)]],
        }),

        viewCount: [0, [Validators.min(0)]],
        status: ['available'],

        metaTags: this.fb.group({
          title: ['', Validators.maxLength(60)],
          description: ['', Validators.maxLength(160)],
          keywords: this.fb.array([]),
        }),
      },
      { validators: this.customValidators }
    )
  }

  private customValidators = (group: AbstractControl) => {
    const form = group as FormGroup
    const newValue = form.get('newValue')?.value
    const previousValue = form.get('previousValue')?.value

    if (newValue && previousValue && newValue <= previousValue) {
      form.get('newValue')?.setErrors({ newValueMustBeGreater: true })
    } else {
      form.get('newValue')?.setErrors(null)
    }

    return null
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.infoForm.get(fieldName)
    return !!(field && field.invalid && (field.touched || field.dirty))
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.infoForm.get(fieldName)
    return !!(field && field.valid && (field.touched || field.dirty))
  }

  isFeatureInvalid(index: number): boolean {
    const feature = this.features.at(index)
    return !!(feature && feature.invalid && (feature.touched || feature.dirty))
  }

  isKeywordInvalid(index: number): boolean {
    const keyword = this.keywords.at(index)
    return !!(keyword && keyword.invalid && (keyword.touched || keyword.dirty))
  }

  isMetaFieldInvalid(fieldName: string): boolean {
    const field = this.metaTagsGroup.get(fieldName)
    return !!(field && field.invalid && (field.touched || field.dirty))
  }

  isImagesInvalid(): boolean {
    return this.images.invalid && (this.images.touched || this.images.dirty)
  }

  get descriptionLength(): number {
    return this.infoForm.get('description')?.value?.length || 0
  }

  get metaTagsGroup(): FormGroup {
    return this.infoForm.get('metaTags') as FormGroup
  }

  get showFormStatus(): boolean {
    return this.infoForm.touched || this.infoForm.dirty
  }

  get formStatusClass(): string {
    if (this.infoForm.invalid && this.infoForm.touched) return 'alert-danger'
    if (this.infoForm.valid) return 'alert-success'
    return 'alert-info'
  }

  get formStatusTitle(): string {
    if (this.infoForm.invalid && this.infoForm.touched)
      return 'PROPERTYADD.STATUS_ERROR'
    if (this.infoForm.valid) return 'PROPERTYADD.STATUS_SUCCESS'
    return 'PROPERTYADD.STATUS_INFO'
  }

  get formStatusMessage(): string {
    if (this.infoForm.invalid && this.infoForm.touched)
      return 'PROPERTYADD.STATUS_ERROR_MESSAGE'
    if (this.infoForm.valid) return 'PROPERTYADD.STATUS_SUCCESS_MESSAGE'
    return 'PROPERTYADD.STATUS_INFO_MESSAGE'
  }

  get features(): FormArray {
    return this.infoForm.get('features') as FormArray
  }

  addFeature() {
    this.features.push(this.fb.control('', [Validators.maxLength(50)]))
  }

  removeFeature(index: number) {
    this.features.removeAt(index)
  }

  get keywords(): FormArray {
    return this.infoForm.get('metaTags')?.get('keywords') as FormArray
  }

  addKeyword() {
    this.keywords.push(this.fb.control('', [Validators.maxLength(30)]))
  }

  removeKeyword(index: number) {
    this.keywords.removeAt(index)
  }

  get images(): FormArray {
    return this.infoForm.get('images') as FormArray
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files) return
    const files: FileList = input.files

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith('image/')) {
        this.infoForm.get('images')?.setErrors({ invalidType: true })
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        this.infoForm.get('images')?.setErrors({ invalidSize: true })
        continue
      }

      this.images.push(this.fb.control(file))
    }

    this.infoForm.get('images')?.updateValueAndValidity()
  }

  removeImage(index: number) {
    this.images.removeAt(index)
  }

  getImageName(image: File | null | undefined): string {
    return image?.name || 'Unknown file'
  }

  submitForm() {
    this.markFormGroupTouched(this.infoForm)

    if (this.infoForm.invalid) {
      this.scrollToFirstInvalidField()
      return
    }

    this.isSubmitting = true
    const formData = this.prepareFormData()

    this.propertyService.addProperty(formData).subscribe({
      next: (res) => {
        console.log('Property created:', res)
        this.isSubmitting = false
        this.showSuccessMessage()
        this.resetForm()
      },
      error: (err) => {
        console.error(' Error creating property:', err)
        this.isSubmitting = false
        this.showErrorMessage(err)
      },
    })
  }

  private prepareFormData(): FormData {
    const formData = new FormData()

    Object.keys(this.infoForm.value).forEach((key) => {
      const value = this.infoForm.get(key)?.value
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    this.images.controls.forEach((ctrl, index) => {
      const file = ctrl.value as File
      if (file) {
        formData.append('images', file, file.name)
      }
    })

    return formData
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key)
      control?.markAsTouched()

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control)
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl)
          } else {
            arrayControl.markAsTouched()
          }
        })
      }
    })
  }

  private scrollToFirstInvalidField(): void {
    const firstInvalidElement = document.querySelector('.is-invalid')
    if (firstInvalidElement) {
      firstInvalidElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  private showSuccessMessage(): void {
    alert('Property created successfully!')
  }

  private showErrorMessage(error: { error?: { message?: string } }): void {
    const errorMessage =
      error.error?.message || 'Failed to create property. Please try again.'
    alert(errorMessage)
  }

  resetForm(): void {
    this.infoForm.reset({
      type: '',
      minInvestment: 500,
      holdingPeriodMonths: 60,
      sharePrice: 1,
      isRented: false,
      rentDistributionFrequency: 'quarterly',
      valuationDate: new Date(),
      acquisitionFeePercent: 1.5,
      annualAdminFeePercent: 0.5,
      exitFeePercent: 2.5,
      performanceFeePercent: 7.0,
      investedAmount: 0,
      investorCount: 0,
      viewCount: 0,
      status: 'available',
      countryCode: 'SA',
    })

    this.features.clear()
    this.images.clear()
    this.keywords.clear()

    this.markFormGroupUntouched(this.infoForm)
  }

  private markFormGroupUntouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key)
      control?.markAsUntouched()

      if (control instanceof FormGroup) {
        this.markFormGroupUntouched(control)
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupUntouched(arrayControl)
          } else {
            arrayControl.markAsUntouched()
          }
        })
      }
    })
  }
}