import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { PropertyService, Property } from '@core/services/property.service';

@Component({
  selector: 'property-data',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule, RouterModule, TranslateModule],
  templateUrl: './property-data.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyDataComponent implements OnInit {
  allProperties: Property[] = [];
  filteredProperties: Property[] = [];
  paginatedList: Property[] = []; 

  currency = '$';
  page = 1;
  pageSize = 6;
  collectionSize = 0;

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.loadAllProperties();
    this.propertyService.properties$.subscribe((data: Property[]) => {
      if (data && data.length) {
        this.filteredProperties = data;
        this.collectionSize = this.filteredProperties.length;
        this.refreshProperties();
      }
    });
  }

  loadAllProperties() {
    this.propertyService.getAllRealEstates().subscribe({
      next: (properties: Property[]) => {
        this.allProperties = properties;
        this.filteredProperties = [...this.allProperties];
        this.collectionSize = this.filteredProperties.length;
        this.refreshProperties();
        this.propertyService.setProperties(this.allProperties);
      },
      error: (err: unknown) => {
        console.error('Error fetching properties:', err);
      },
    });
  }

  refreshProperties() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedList = this.filteredProperties.slice(start, end);
  }
}
