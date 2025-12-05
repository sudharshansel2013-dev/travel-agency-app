import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">TravelAgency Pro</h1>
        <div class="space-y-4 text-left">
          <input type="text" [(ngModel)]="username" class="w-full px-4 py-2 border rounded" placeholder="admin">
          <input type="password" [(ngModel)]="password" class="w-full px-4 py-2 border rounded" placeholder="admin123">
          <button (click)="onLogin()" class="w-full bg-blue-600 text-white font-bold py-2 rounded">Sign In</button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  store = inject(StoreService);
  username = signal('');
  password = signal('');
  
  async onLogin() {
    await this.store.login(this.username(), this.password());
  }
}
