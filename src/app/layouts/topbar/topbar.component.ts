import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Inject,
  inject,
  Output,
} from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store'
import { changetheme } from '@store/layout/layout-action'
import { getLayoutColor } from '@store/layout/layout-selector'
import { SimplebarAngularModule } from 'simplebar-angular'
import { notificationsData } from './data'
import { CommonModule, DOCUMENT } from '@angular/common'
import { logout } from '@store/authentication/authentication.actions'
import { TranslateModule } from '@ngx-translate/core'
import { LanguageService } from '@core/services/language.service'

type FullScreenTypes = {
  requestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
  webkitFullscreenElement?: Element
  msRequestFullscreen?: () => Promise<void>
  mozRequestFullscreen?: () => Promise<void>
  webkitRequestFullscreen?: () => Promise<void>
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [SimplebarAngularModule, NgbDropdownModule,TranslateModule, CommonModule ],
  templateUrl: './topbar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [`
    .language-dropdown .dropdown-toggle {
      border: 1px solid var(--bs-border-color);
      background: var(--bs-body-bg);
      color: var(--bs-body-color);
      transition: all 0.3s ease;
    }
    
    .language-dropdown .dropdown-toggle:hover {
      border-color: var(--bs-primary);
      background: var(--bs-primary-bg-subtle);
    }
    
    .language-dropdown .dropdown-item {
      transition: all 0.2s ease;
      border-radius: 6px;
      margin: 2px 4px;
    }
    
    .language-dropdown .dropdown-item:hover {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary);
    }
    
    .language-dropdown .dropdown-item.active {
      background: var(--bs-primary-bg-subtle);
      color: var(--bs-primary);
    }
    
    .language-flag {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class TopbarComponent {
  notificationList = notificationsData
  element!: FullScreenTypes
    isRTL = false;

  @Output() settingsButtonClicked = new EventEmitter()
  @Output() mobileMenuButtonClicked = new EventEmitter()

  router = inject(Router)
  store = inject(Store)
  languageService = inject(LanguageService);

  constructor(@Inject(DOCUMENT) private document: Document & FullScreenTypes) {
    this.element = this.document.documentElement as FullScreenTypes

    this.languageService.currentLang$.subscribe((lang: string) => {
      this.isRTL = lang === 'ar';
    });
  }

  settingMenu() {
    this.settingsButtonClicked.emit()
  }

  toggleMobileMenu() {
    this.mobileMenuButtonClicked.emit()
  }

  changeTheme() {
    const color = document.documentElement.getAttribute('data-bs-theme')
    if (color == 'light') {
      this.store.dispatch(changetheme({ color: 'dark' }))
    } else {
      this.store.dispatch(changetheme({ color: 'light' }))
    }
    this.store.select(getLayoutColor).subscribe((color) => {
      document.documentElement.setAttribute('data-bs-theme', color)
    })
  }

  fullscreen() {
    document.body.classList.toggle('fullscreen-enable')
    if (
      !document.fullscreenElement &&
      !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement
    ) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen()
      } else if (this.element.mozRequestFullScreen) {
        this.element.mozRequestFullScreen()
      } else if (this.element.webkitRequestFullscreen) {
        this.element.webkitRequestFullscreen()
      } else if (this.element.msRequestFullscreen) {
        this.element.msRequestFullscreen()
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen()
      } else if (this.document.mozCancelFullScreen) {
        this.document.mozCancelFullScreen()
      } else if (this.document.webkitExitFullscreen) {
        this.document.webkitExitFullscreen()
      } else if (this.document.msExitFullscreen) {
        this.document.msExitFullscreen()
      }
    }
  }

  logout() {
    this.store.dispatch(logout())
  }
  toggleLang(): void {
    this.languageService.toggleLanguage()
  }

  switchLanguage(lang: string): void {
    this.languageService.setLanguage(lang)
  }
}
