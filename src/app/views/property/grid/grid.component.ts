import { Component } from '@angular/core'
import { PageTitleComponent } from '@component/page-title.component'
import { PropertyFilterComponent } from './components/property-filter/property-filter.component'
import { PropertyDataComponent } from './components/property-data/property-data.component'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [PageTitleComponent, PropertyFilterComponent, PropertyDataComponent ,TranslateModule ],
  templateUrl: './grid.component.html',
  styles: ``,
})
export class GridComponent {}
