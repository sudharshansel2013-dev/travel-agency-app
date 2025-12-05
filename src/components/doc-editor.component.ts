import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Document } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-doc-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-5xl mx-auto my-8">
      <div class="flex justify-between mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold">{{ type() | titlecase }}</h2>
        <button (click)="cancel.emit()" class="text-gray-500">Close</button>
      </div>

      <div class="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-bold">Customer</label>
          <select [(ngModel)]="doc.customerId" class="w-full p-2 border rounded">
            <option value="">Select Customer</option>
            @for (c of store.customers(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
          </select>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div><label>Number</label><input [(ngModel)]="doc.number" class="w-full p-2 border rounded"></div>
            <div><label>Date</label><input type="date" [(ngModel)]="doc.date" class="w-full p-2 border rounded"></div>
        </div>
        <div class="col-span-2">
            <label>Destination</label>
            <input [(ngModel)]="doc.destination" class="w-full p-2 border rounded" placeholder="Destination">
        </div>
        <div>
            <label>Duration (Days)</label>
            <input type="number" [(ngModel)]="doc.duration" class="w-full p-2 border rounded">
        </div>
      </div>

      <div class="mb-6 bg-blue-50 p-4 rounded">
        <button (click)="generateItinerary()" [disabled]="loadingAi()" class="bg-blue-600 text-white px-3 py-1 rounded">
           {{ loadingAi() ? 'Thinking...' : 'Generate AI Itinerary' }}
        </button>
      </div>

      <table class="w-full mb-6">
          <thead><tr><th>Desc</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead>
          <tbody>
            @for (item of doc.items; track $index) {
              <tr>
                <td><input [(ngModel)]="item.description" class="w-full border p-1"></td>
                <td><input type="number" [(ngModel)]="item.qty" class="w-full border p-1"></td>
                <td><input type="number" [(ngModel)]="item.price" class="w-full border p-1"></td>
                <td>{{ (item.qty * item.price) | currency: store.settings().currency }}</td>
                <td><button (click)="doc.items.splice($index, 1)" class="text-red-500">X</button></td>
              </tr>
            }
          </tbody>
      </table>
      <button (click)="addItem()" class="text-blue-600 mb-4">+ Add Item</button>

      <div class="flex justify-end gap-2">
        <button (click)="save()" class="bg-blue-600 text-white px-6 py-2 rounded">Save</button>
      </div>
    </div>
  `
})
export class DocEditorComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  type = input.required<'invoice' | 'quotation'>();
  editDoc = input<Document | null>(null);
  saveDoc = output<Document>();
  cancel = output<void>();

  doc: Document = { id: '', type: 'invoice', number: '', date: '', customerId: '', items: [], status: 'draft', duration: 7 };
  loadingAi = signal(false);

  constructor() {
    effect(() => {
      if (this.editDoc()) this.doc = JSON.parse(JSON.stringify(this.editDoc()));
      else this.doc = { id: '', type: this.type(), number: 'INV-' + Date.now(), date: new Date().toISOString().split('T')[0], customerId: '', items: [], status: 'draft', duration: 7 };
    });
  }

  addItem() { this.doc.items.push({ description: '', qty: 1, price: 0 }); }
  save() { if(this.doc.customerId) this.saveDoc.emit(this.doc); }
  
  async generateItinerary() {
    if(!this.doc.destination) return;
    this.loadingAi.set(true);
    const items = await this.gemini.generateItineraryItems(this.doc.destination, this.doc.duration || 5, this.store.settings().currency);
    if (items.length) {
        this.doc.items = [];
        items.forEach(i => this.doc.items.push({ description: i.description, qty: 1, price: i.price }));
    }
    this.loadingAi.set(false);
  }
}
