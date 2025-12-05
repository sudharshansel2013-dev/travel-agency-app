import { Injectable, signal, effect, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface LineItem {
  description: string;
  qty: number;
  price: number;
}

export interface Document {
  id: string;
  type: 'invoice' | 'quotation';
  number: string;
  date: string;
  validUntil?: string;
  dueDate?: string;
  travelDate?: string;
  duration?: number;
  destination?: string;
  customerId: string;
  items: LineItem[];
  notes?: string;
  status: 'draft';
  paymentMethod?: string;
}

export interface Settings {
  agencyName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
  currency: string;
  paperSize: 'a4';
  bankDetails: string;
  layoutTemplate: 'modern';
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private http = inject(HttpClient);
  private apiUrl = 'api.php'; 
  private LOCAL_STORAGE_KEY = 'travel_agency_data';

  readonly defaultSettings: Settings = {
    agencyName: 'My Travel Agency',
    email: 'info@mytravel.com',
    phone: '+1 234 567 8900',
    address: '123 Travel St, City, Country',
    logoUrl: '',
    primaryColor: '#2563eb',
    currency: 'USD',
    paperSize: 'a4',
    bankDetails: 'Bank: Global Bank',
    layoutTemplate: 'modern'
  };

  customers = signal<Customer[]>([]);
  documents = signal<Document[]>([]);
  settings = signal<Settings>(this.defaultSettings);
  currentUser = signal<string | null>(null);
  currentPass = signal<string | null>(null);
  syncStatus = signal('idle');
  lastSyncTime = signal<Date | null>(null);

  constructor() {
    this.loadFromLocal();
    effect((onCleanup) => {
      const c = this.customers();
      const d = this.documents();
      const s = this.settings();
      const user = this.currentUser();
      if (!user) return; 
      this.saveToLocal();
      const timeoutId = setTimeout(() => { this.saveToServer(); }, 2000); 
      onCleanup(() => clearTimeout(timeoutId));
    });
  }

  async login(u: string, p: string): Promise<boolean> {
    this.currentUser.set(u);
    this.currentPass.set(p);
    try {
        await this.loadFromServer();
        return true;
    } catch (e: any) {
        if (e instanceof HttpErrorResponse && e.status === 401) {
            this.currentUser.set(null);
            this.currentPass.set(null);
            return false; 
        }
        this.syncStatus.set('offline');
        this.loadFromLocal();
        return true;
    }
  }

  logout() {
    this.currentUser.set(null);
    this.currentPass.set(null);
  }

  async loadFromServer() {
    this.syncStatus.set('syncing');
    const u = this.currentUser();
    const p = this.currentPass();
    const url = this.apiUrl + '?u=' + encodeURIComponent(u || '') + '&p=' + encodeURIComponent(p || '');
    const data: any = await firstValueFrom(this.http.get(url));
    if (data && !data.error) {
      if (Array.isArray(data.customers)) this.customers.set(data.customers);
      if (Array.isArray(data.documents)) this.documents.set(data.documents);
      if (data.settings) this.settings.set({ ...this.defaultSettings, ...data.settings });
      this.syncStatus.set('success');
      this.lastSyncTime.set(new Date());
      this.saveToLocal();
    }
  }

  async saveToServer() {
    const user = this.currentUser();
    const pass = this.currentPass();
    if (!user || !pass) return;
    this.syncStatus.set('syncing');
    const payload = { customers: this.customers(), documents: this.documents(), settings: this.settings() };
    const body = { auth: { username: user, password: pass }, payload: payload };
    try {
        await firstValueFrom(this.http.post(this.apiUrl, body));
        this.syncStatus.set('success');
        this.lastSyncTime.set(new Date());
    } catch (e) {
        this.syncStatus.set(this.syncStatus() === 'offline' ? 'offline' : 'error');
    }
  }

  private saveToLocal() {
    const data = { customers: this.customers(), documents: this.documents(), settings: this.settings(), user: this.currentUser() };
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  private loadFromLocal() {
    const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (raw) {
        try {
            const data = JSON.parse(raw);
            if (data.customers) this.customers.set(data.customers);
            if (data.documents) this.documents.set(data.documents);
            if (data.settings) this.settings.set(data.settings);
        } catch (e) { console.error(e); }
    }
  }

  addCustomer(c: Omit<Customer, 'id'>) { this.customers.update(l => [...l, { ...c, id: crypto.randomUUID() }]); }
  deleteCustomer(id: string) { this.customers.update(l => l.filter(c => c.id !== id)); }
  addDocument(d: Omit<Document, 'id'>) { this.documents.update(l => [...l, { ...d, id: crypto.randomUUID() }]); }
  updateDocument(id: string, updates: Partial<Document>) { this.documents.update(l => l.map(d => d.id === id ? { ...d, ...updates } : d)); }
  deleteDocument(id: string) { this.documents.update(l => l.filter(d => d.id !== id)); }
  updateSettings(s: Partial<Settings>) { this.settings.update(curr => ({ ...curr, ...s })); }
  
  getBackupJson(): string {
    return JSON.stringify({ customers: this.customers(), documents: this.documents(), settings: this.settings() }, null, 2);
  }
  restoreBackup(jsonStr: string) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.customers) this.customers.set(parsed.customers);
      if (parsed.documents) this.documents.set(parsed.documents);
      if (parsed.settings) this.settings.set(parsed.settings);
      this.saveToLocal();
    } catch (e) { alert('Invalid backup file.'); }
  }
}
