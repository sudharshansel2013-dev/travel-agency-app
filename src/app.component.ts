import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './services/store.service';
import { LoginComponent } from './components/login.component';
import { DocManagerComponent } from './components/doc-manager.component';
import { CustomerManagerComponent } from './components/customer-manager.component';
import { SettingsComponent } from './components/settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, DocManagerComponent, CustomerManagerComponent, SettingsComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  store = inject(StoreService);
  currentView = signal('dashboard');
  setView(v: any) { this.currentView.set(v); }
  logout() { this.store.logout(); }
}
