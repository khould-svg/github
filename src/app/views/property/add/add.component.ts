import { Component } from '@angular/core'
import { CommonModule, CurrencyPipe } from '@angular/common'
import { PageTitleComponent } from '@component/page-title.component'
import { AddInformationComponent } from './components/add-information/add-information.component'
import { PropertyService, Property } from '@core/services/property.service'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    PageTitleComponent,
    AddInformationComponent,
    TranslateModule,
  ],
  templateUrl: './add.component.html',
  styles: ``,
})
export class AddComponent {
  createdProperty: Property | null = null
  propertyData: Partial<Property> = {}

  constructor(private propertyService: PropertyService) {}

  onInfoChange(updatedData: Partial<Property>) {
    this.propertyData = { ...this.propertyData, ...updatedData }
  }

  createProperty() {
    const formData = new FormData()

    ;(Object.keys(this.propertyData) as (keyof Property)[]).forEach((key) => {
      const value = this.propertyData[key]
      if (value !== '' && value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : value.toString()
        )
      }
    })

    this.propertyService.addProperty(formData).subscribe({
      next: (res: Property) => {
        this.createdProperty = res
        alert(' تم إضافة العقار بنجاح')
        this.propertyData = {}
      },
      error: (err: { error?: { message?: string } }) => {
        console.error(err)
        alert(err.error?.message || ' حصل خطأ في إضافة العقار')
      },
    })
  }
}
