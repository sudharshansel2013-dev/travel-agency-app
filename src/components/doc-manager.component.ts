import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Document } from '../services/store.service';
import { DocEditorComponent } from './doc-editor.component';
import { DocPreviewComponent } from './doc-preview.component';

@Component({
  selector: 'app-doc-manager',
  standalone: true,
  imports: [CommonModule, DocEditorComponent, DocPreviewComponent],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">{{ type() | titlecase }}s</h2>
        <button (click)="createNew()" class="bg-blue-600 text-white px-4 py-2 rounded">New {{ type() }}</button>
      </div>
      <div class="bg-white rounded shadow">
        @for (d of filteredDocs(); track d.id) {
          <div class="p-4 border-b flex justify-between">
            <div><span class="font-bold text-blue-600">{{ d.number }}</span> - {{ getCustomerName(d.customerId) }}</div>
            <div class="space-x-2">
                <button (click)="preview(d)" class="text-gray-500">Preview</button>
                <button (click)="edit(d)" class="text-blue-500">Edit</button>
                <button (click)="delete(d.id)" class="text-red-500">Delete</button>
            </div>
          </div>
        }
      </div>
    </div>
    @if (showEditor()) { <app-doc-editor [type]="type()" [editDoc]="selectedDoc()" (cancel)="closeEditor()" (saveDoc)="onSave($event)"></app-doc-editor> }
    @if (showPreview()) { <app-doc-preview [doc]="selectedDoc()" (close)="closePreview()"></app-doc-preview> }
  `
})
export class DocManagerComponent {
  store = inject(StoreService);
  type = input.required<'invoice' | 'quotation'>();
  showEditor = signal(false);
  showPreview = signal(false);
  selectedDoc = signal<Document | null>(null);

  filteredDocs = computed(() => this.store.documents().filter(d => d.type === this.type()));
  getCustomerName(id: string) { return this.store.customers().find(c => c.id === id)?.name || 'Unknown'; }

  createNew() { this.selectedDoc.set(null); this.showEditor.set(true); }
  edit(d: Document) { this.selectedDoc.set(d); this.showEditor.set(true); }
  preview(d: Document) { this.selectedDoc.set(d); this.showPreview.set(true); }
  delete(id: string) { if(confirm('Delete?')) this.store.deleteDocument(id); }
  closeEditor() { this.showEditor.set(false); }
  closePreview() { this.showPreview.set(false); }
  onSave(d: Document) { if (d.id) this.store.updateDocument(d.id, d); else this.store.addDocument(d); this.closeEditor(); }
}
