import { Component } from '@angular/core'
import { PageTitleComponent } from '@component/page-title.component'
import { CustomerCardComponent } from './components/customer-card/customer-card.component'
import { CustomerInfoComponent } from './components/customer-info/customer-info.component'
import { FileUploaderComponent } from '@component/file-uploader/file-uploader.component'
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [PageTitleComponent, CustomerInfoComponent, TranslateModule],
  templateUrl: './add.component.html',
  styles: ``,
})
export class AddComponent {}
