import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Customer } from '../services/store.service';

@Component({
  selector: 'app-customer-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Customers</h2>
      <div class="mb-6 flex gap-2">
        <input [(ngModel)]="newCustomer.name" placeholder="Name" class="border p-2 rounded">
        <input [(ngModel)]="newCustomer.email" placeholder="Email" class="border p-2 rounded">
        <button (click)="save()" class="bg-blue-600 text-white px-4 rounded">Add</button>
      </div>
      <div class="grid gap-4">
        @for (c of store.customers(); track c.id) {
          <div class="bg-white p-4 rounded shadow flex justify-between">
            <div><div class="font-bold">{{ c.name }}</div><div class="text-sm">{{ c.email }}</div></div>
            <button (click)="delete(c.id)" class="text-red-500">Delete</button>
          </div>
        }
      </div>
    </div>
  `
})
export class CustomerManagerComponent {
  store = inject(StoreService);
  newCustomer: any = { name: '', email: '', phone: '', address: '' };
  save() { if (!this.newCustomer.name) return; this.store.addCustomer(this.newCustomer); this.newCustomer = { name: '', email: '' }; }
  delete(id: string) { if(confirm('Delete?')) this.store.deleteCustomer(id); }
}
