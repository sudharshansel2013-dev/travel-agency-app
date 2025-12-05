import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl">
      <h2 class="text-2xl font-bold mb-6">Settings</h2>
      <div class="bg-white p-6 rounded shadow space-y-4">
        <div><label>Agency Name</label><input [(ngModel)]="store.settings().agencyName" class="w-full border p-2 rounded"></div>
        <div><label>Email</label><input [(ngModel)]="store.settings().email" class="w-full border p-2 rounded"></div>
        <div><label>Currency</label><input [(ngModel)]="store.settings().currency" class="w-full border p-2 rounded"></div>
        <button (click)="save()" class="bg-blue-600 text-white px-4 py-2 rounded">Save Settings</button>
      </div>
    </div>
  `
})
export class SettingsComponent {
  store = inject(StoreService);
  save() { this.store.updateSettings(this.store.settings()); }
}
