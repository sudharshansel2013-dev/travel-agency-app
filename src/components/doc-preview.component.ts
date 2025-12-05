import { Component, inject, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Document } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-doc-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 overflow-y-auto flex justify-center py-10">
      <div class="relative w-full max-w-4xl bg-white p-8">
        <div class="flex justify-between mb-4 no-print">
            <h2 class="font-bold">Preview</h2>
            <div class="flex gap-2">
                <button (click)="generateEmail()" class="bg-purple-600 text-white px-3 py-1 rounded">AI Email</button>
                <button (click)="print()" class="bg-blue-600 text-white px-3 py-1 rounded">Print</button>
                <button (click)="close.emit()" class="bg-gray-200 px-3 py-1 rounded">Close</button>
            </div>
        </div>
        @if (emailDraft()) {
           <div class="bg-gray-100 p-4 mb-4 whitespace-pre-wrap text-sm border">{{ emailDraft() }}</div>
        }
        <div class="border p-8">
             <h1 class="text-3xl font-bold mb-4">{{ settings().agencyName }}</h1>
             <div class="flex justify-between mb-8">
                <div>To: {{ customer()?.name }}</div>
                <div class="text-right">
                    <div class="font-bold">{{ doc()?.type | uppercase }} #{{ doc()?.number }}</div>
                    <div>Date: {{ doc()?.date }}</div>
                    @if(doc()?.duration) { <div>Duration: {{ doc()?.duration }} Days</div> }
                </div>
             </div>
             <table class="w-full mb-8">
               <tr class="border-b font-bold"><td class="py-2">Description</td><td class="text-right">Price</td><td class="text-right">Total</td></tr>
               @for (item of doc()?.items; track $index) {
                 <tr class="border-b"><td class="py-2">{{ item.description }}</td><td class="text-right">{{ item.price }}</td><td class="text-right">{{ item.qty * item.price }}</td></tr>
               }
             </table>
             <div class="text-right font-bold text-xl">Total: {{ total() | currency: settings().currency }}</div>
        </div>
      </div>
    </div>
  `
})
export class DocPreviewComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  doc = input.required<Document | null>();
  close = output<void>();
  settings = this.store.settings;
  emailDraft = signal('');
  
  customer = computed(() => this.store.customers().find(c => c.id === this.doc()?.customerId));
  total = computed(() => this.doc()?.items.reduce((acc, item) => acc + (item.qty * item.price), 0) || 0);

  print() { window.print(); }
  async generateEmail() {
    this.emailDraft.set('Generating...');
    const t = await this.gemini.generateEmail(this.doc()!.type, this.customer()!.name, this.doc()!.number, String(this.total()));
    this.emailDraft.set(t);
  }
}
