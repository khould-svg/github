import { CommonModule, DecimalPipe } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { FormsModule } from '@angular/forms'
import { currency } from '@common/constants'
import {
  NgbDropdownModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap'
import { PropertyService, Property } from '@core/services/property.service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'property-data',
  standalone: true,
  imports: [
    DecimalPipe,
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    NgbDropdownModule,
    TranslateModule,
  ],
  templateUrl: './property-data.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyDataComponent implements OnInit {
  propertyList: Property[] = [] 
  filteredProperties: Property[] = [] 
  paginatedProperties: Property[] = [] 

  currency = currency

  selectedProperty: Property | null = null
  isEditMode: boolean = false
  editPropertyData: Partial<Property> = {}
  page = 1
  pageSize = 10
  collectionSize = 0

  searchText: string = ''
  private searchTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(
    private modalService: NgbModal,
    private propertyService: PropertyService
  ) {}

  ngOnInit() {
    this.loadAllProperties()
  }


  loadAllProperties(): void {
    this.propertyService.getAllRealEstates().subscribe({
      next: (properties: Property[]) => {
        this.propertyList = properties || []
        this.filteredProperties = [...this.propertyList]
        this.collectionSize = this.filteredProperties.length
        this.refreshProperties()
      },
      error: (err) => {
        console.error('Error fetching properties', err)
      },
    })
  }

  refreshProperties(): void {
    const start = (this.page - 1) * this.pageSize
    const end = start + this.pageSize
    this.paginatedProperties = this.filteredProperties.slice(start, end)
  }


  filterProperties(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout)

    this.searchTimeout = setTimeout(() => {
      const search = this.searchText.trim()

      if (!search) {
        this.filteredProperties = [...this.propertyList]
        this.collectionSize = this.filteredProperties.length
        this.refreshProperties()
        return
      }

      this.propertyService.searchProperties(search).subscribe({
        next: (properties: Property[]) => {
          this.filteredProperties = Array.isArray(properties) ? properties : []
          if (!this.filteredProperties.length) {
            this.filteredProperties = this.clientFilter(search)
          }
          this.collectionSize = this.filteredProperties.length
          this.refreshProperties()
        },
        error: () => {
          this.filteredProperties = this.clientFilter(search)
          this.collectionSize = this.filteredProperties.length
          this.refreshProperties()
        },
      })
    }, 300)
  }

  private clientFilter(search: string): Property[] {
    const s = search.toLowerCase()
    return this.propertyList.filter((item) =>
      [
        item?.name,
        item?.country,
        item?.location,
        item?.propertyType,
        item?.type,
      ].some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(s)
      )
    )
  }


  openPropertyModal(content: unknown, property: Property): void {
    this.selectedProperty = property
    this.isEditMode = false
    this.editPropertyData = {}
    this.modalService.open(content, { size: 'lg' })
  }


  enterEditMode(): void {
    if (!this.selectedProperty) return

    this.isEditMode = true
    this.editPropertyData = {
      name: this.selectedProperty.name,
      type: this.selectedProperty.type,
      location: this.selectedProperty.location,
      status: this.selectedProperty.status,
      totalValue: this.selectedProperty.totalValue,
      bedrooms: this.selectedProperty.bedrooms,
      bathrooms: this.selectedProperty.bathrooms,
      size: this.selectedProperty.size,
      description: this.selectedProperty.description,
    }
  }

  cancelEdit(): void {
    this.isEditMode = false
    this.editPropertyData = {}
  }

  isFormValid(): boolean {
    return !!(
      this.editPropertyData.name?.trim() &&
      this.editPropertyData.type &&
      this.editPropertyData.location?.trim() &&
      this.editPropertyData.status &&
      this.editPropertyData.totalValue! > 0
    )
  }

  saveProperty(modal: { dismiss: () => void }): void {
    if (!this.selectedProperty?._id) {
      console.error('No property selected for editing')
      return
    }

    this.propertyService
      .updateRealEstate(this.selectedProperty._id, this.editPropertyData)
      .subscribe({
        next: (response) => {
          console.log('Property updated successfully', response)
          this.isEditMode = false
          this.editPropertyData = {}
          modal.dismiss()
          this.loadAllProperties()
        },
        error: (error) => {
          console.error('Error updating property', error)
          alert('Failed to update property. Please try again.')
        },
      })
  }


  deleteProperty(modal: { dismiss: () => void }): void {
    if (!this.selectedProperty?._id) {
      console.error('No property selected for deletion')
      return
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${this.selectedProperty.name}"? This action cannot be undone.`
    )

    if (confirmDelete) {
      this.propertyService
        .deleteRealEstate(this.selectedProperty._id)
        .subscribe({
          next: (response) => {
            console.log('Property deleted successfully', response)
            modal.dismiss()
            this.loadAllProperties()
          },
          error: (error) => {
            console.error('Error deleting property', error)
            alert('Failed to delete property. Please try again.')
          },
        })
    }
  }
}
