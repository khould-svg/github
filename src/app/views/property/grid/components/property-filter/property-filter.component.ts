import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NouisliderModule } from 'ng2-nouislider'
import { PropertyService, Property } from '@core/services/property.service'

@Component({
  selector: 'property-filter',
  standalone: true,
  imports: [NouisliderModule, FormsModule, CommonModule, TranslateModule],
  templateUrl: './property-filter.component.html',
  styles: ``,
})
export class PropertyFilterComponent implements OnInit {
  searchText: string = ''
  selectedLocation: string = ''
  selectedType: string = ''
  selectedFeatures: string[] = []
  someRange: number[] = [0, 500000]
  rangeConfig = {
    behaviour: 'drag',
    connect: true,
    range: {
      min: 0,
      max: 25000000,
    },
    step: 1000,
  }

  locations: string[] = ['Cairo', 'Alexandria', 'Giza']
  types: string[] = ['Apartment', 'Villa', 'Studio']
  features: string[] = ['Pool', 'Garage', 'Garden', 'Gym']
  filteredProperties: Property[] = []

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadAllProperties()
  }

  loadAllProperties(): void {
    this.propertyService.getAllRealEstates().subscribe({
      next: (properties: Property[]) => {
        this.filteredProperties = properties
        this.propertyService.setProperties(this.filteredProperties)
      },
      error: (err: unknown) => {
        console.error('Error fetching properties:', err)
      },
    })
  }

  applyFilters(): void {
    this.propertyService.getAllRealEstates().subscribe({
      next: (properties: Property[]) => {
        let filtered = [...properties]

        if (this.searchText.trim()) {
          const q = this.searchText.toLowerCase()
          filtered = filtered.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.location?.toLowerCase().includes(q)
          )
        }

        filtered = filtered.filter(
          (p) =>
            p.totalValue >= this.someRange[0] &&
            p.totalValue <= this.someRange[1]
        )

        if (this.selectedType) {
          filtered = filtered.filter((p) => p.type === this.selectedType)
        }

        if (this.selectedLocation) {
          filtered = filtered.filter(
            (p) => p.location === this.selectedLocation
          )
        }

        if (this.selectedFeatures.length > 0) {
          filtered = filtered.filter((p) =>
            this.selectedFeatures.every((f) => p.features?.includes(f))
          )
        }

        this.filteredProperties = filtered
        this.propertyService.setProperties(filtered)
        console.log('Filtered (frontend) Properties:', this.filteredProperties)
      },
      error: (err: unknown) => {
        console.error('Error fetching properties:', err)
      },
    })
  }

  onSearchChange(): void {
    if (this.searchText.trim().length > 0) {
      this.propertyService.searchProperties(this.searchText).subscribe({
        next: (res: Property[] | { properties: Property[] }) => {
          const properties = 'properties' in res ? res.properties : res
          this.filteredProperties = properties
          this.propertyService.setProperties(this.filteredProperties)
        },
        error: (err: unknown) => {
          console.error('Error searching properties:', err)
          this.filteredProperties = []
          this.propertyService.setProperties([])
        },
      })
    } else {
      this.loadAllProperties()
    }
  }
}
