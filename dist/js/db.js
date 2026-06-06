/**
 * Help Vitall Database Management
 * Uses Supabase when configured and keeps IndexedDB as a local fallback only.
 */

const DB_NAME = 'HelpVitallDB';
const DB_VERSION = 1;

const SUPABASE_CONFIG = window.HELP_VITALL_ENV || {};
const SUPABASE_URL = SUPABASE_CONFIG.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.SUPABASE_ANON_KEY || '';

const TABLE_MAP = {
  products: 'products',
  clients: 'clients',
  expenses: 'expenses',
  settings: 'settings',
  spreadsheet_imports: 'spreadsheet_imports'
};

function removeEmptyId(item) {
  const copy = { ...item };
  if (copy.id === '' || copy.id === undefined || copy.id === null) {
    delete copy.id;
  }
  return copy;
}

function toDbRow(storeName, item) {
  const clean = removeEmptyId(item);

  if (storeName === 'products') {
    return {
      id: clean.id,
      name: clean.name,
      niche: clean.nicho ?? clean.niche ?? '',
      cost: Number(clean.cost) || 0,
      status: clean.status || 'active',
      attendants: clean.attendants || '',
      plans: clean.plans || []
    };
  }

  if (storeName === 'clients') {
    return {
      id: clean.id,
      name: clean.name,
      phone: clean.phone || '',
      country: clean.country || 'Brasil',
      zip: clean.zip || '',
      address: clean.address || '',
      city: clean.city || '',
      state: clean.state || '',
      product_id: clean.productId || null,
      plan_name: clean.planName || '',
      sale_value: Number(clean.saleValue) || 0,
      attendant: clean.attendant || '',
      date: clean.date || new Date().toISOString().slice(0, 10),
      status: clean.status || 'Pagamento pendente',
      tracking_code: clean.trackingCode || '',
      payment_date: clean.paymentDate || '',
      delivery_date: clean.deliveryDate || '',
      observations: clean.observations || '',
      bottles: Number(clean.bottles) || 0,
      sent: Boolean(clean.sent),
      delivered: Boolean(clean.delivered)
    };
  }

  if (storeName === 'expenses') {
    return {
      id: clean.id,
      name: clean.name,
      category: clean.category || '',
      value: Number(clean.value) || 0,
      date: clean.date || new Date().toISOString().slice(0, 10),
      product_id: clean.productId || null,
      obs: clean.observation || clean.obs || ''
    };
  }

  if (storeName === 'settings') {
    return {
      key: clean.key,
      value: clean.value
    };
  }

  if (storeName === 'spreadsheet_imports') {
    return {
      id: clean.id,
      file_name: clean.fileName || '',
      source_type: clean.sourceType || 'unknown',
      total_rows: Number(clean.totalRows) || 0,
      imported_count: Number(clean.importedCount) || 0,
      duplicate_count: Number(clean.duplicateCount) || 0,
      paid_count: Number(clean.paidCount) || 0,
      pending_count: Number(clean.pendingCount) || 0,
      scam_count: Number(clean.scamCount) || 0,
      error_count: Number(clean.errorCount) || 0,
      total_revenue: Number(clean.totalRevenue) || 0,
      total_loss: Number(clean.totalLoss) || 0,
      summary: clean.summary || {}
    };
  }

  return clean;
}

function fromDbRow(storeName, row) {
  if (!row) return row;

  if (storeName === 'products') {
    return {
      id: row.id,
      name: row.name,
      nicho: row.niche || '',
      cost: Number(row.cost) || 0,
      status: row.status || 'active',
      attendants: row.attendants || '',
      plans: Array.isArray(row.plans) ? row.plans : []
    };
  }

  if (storeName === 'clients') {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone || '',
      country: row.country || 'Brasil',
      zip: row.zip || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      productId: row.product_id,
      planName: row.plan_name || '',
      saleValue: Number(row.sale_value) || 0,
      attendant: row.attendant || '',
      date: row.date || '',
      status: row.status || 'Pagamento pendente',
      trackingCode: row.tracking_code || '',
      paymentDate: row.payment_date || '',
      deliveryDate: row.delivery_date || '',
      observations: row.observations || '',
      bottles: Number(row.bottles) || 0,
      sent: Boolean(row.sent),
      delivered: Boolean(row.delivered)
    };
  }

  if (storeName === 'expenses') {
    return {
      id: row.id,
      name: row.name,
      category: row.category || '',
      value: Number(row.value) || 0,
      date: row.date || '',
      productId: row.product_id,
      observation: row.obs || ''
    };
  }

  if (storeName === 'settings') {
    return {
      key: row.key,
      value: row.value
    };
  }

  if (storeName === 'spreadsheet_imports') {
    return {
      id: row.id,
      fileName: row.file_name || '',
      sourceType: row.source_type || 'unknown',
      totalRows: Number(row.total_rows) || 0,
      importedCount: Number(row.imported_count) || 0,
      duplicateCount: Number(row.duplicate_count) || 0,
      paidCount: Number(row.paid_count) || 0,
      pendingCount: Number(row.pending_count) || 0,
      scamCount: Number(row.scam_count) || 0,
      errorCount: Number(row.error_count) || 0,
      totalRevenue: Number(row.total_revenue) || 0,
      totalLoss: Number(row.total_loss) || 0,
      summary: row.summary || {}
    };
  }

  return row;
}

class HelpVitallDB {
  constructor() {
    this.db = null;
    this.supabase = null;
    this.mode = 'local';
  }

  async init() {
    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
      this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      this.mode = 'supabase';
      return this;
    }

    await this.initLocal();
    return this;
  }

  initLocal() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this);
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('Database failed to open:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('clients')) {
          const clientStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
          clientStore.createIndex('productId', 'productId', { unique: false });
          clientStore.createIndex('date', 'date', { unique: false });
          clientStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
          expenseStore.createIndex('productId', 'productId', { unique: false });
          expenseStore.createIndex('date', 'date', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  isSupabaseReady() {
    return this.mode === 'supabase' && Boolean(this.supabase);
  }

  getSupabaseClient() {
    return this.supabase;
  }

  async getAll(storeName) {
    if (this.isSupabaseReady()) {
      const table = TABLE_MAP[storeName];
      if (!table) throw new Error(`Tabela não mapeada: ${storeName}`);

      const orderColumn = storeName === 'settings' ? 'key' : 'id';
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .order(orderColumn, { ascending: true });

      if (error) throw error;
      return (data || []).map((row) => fromDbRow(storeName, row));
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    if (this.isSupabaseReady()) {
      const table = TABLE_MAP[storeName];
      const idColumn = storeName === 'settings' ? 'key' : 'id';
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq(idColumn, key)
        .maybeSingle();

      if (error) throw error;
      return fromDbRow(storeName, data);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(Number(key) || key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(storeName, item) {
    if (this.isSupabaseReady()) {
      const table = TABLE_MAP[storeName];
      const row = toDbRow(storeName, item);
      delete row.id;

      const { data, error } = await this.supabase
        .from(table)
        .insert(row)
        .select('*')
        .single();

      if (error) throw error;
      return data?.id || data?.key;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const cleanItem = removeEmptyId(item);
      const request = store.add(cleanItem);

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, item) {
    if (this.isSupabaseReady()) {
      const table = TABLE_MAP[storeName];
      const row = toDbRow(storeName, item);
      const idColumn = storeName === 'settings' ? 'key' : 'id';

      if (!row[idColumn]) {
        return this.add(storeName, item);
      }

      const { data, error } = await this.supabase
        .from(table)
        .update(row)
        .eq(idColumn, row[idColumn])
        .select('*')
        .single();

      if (error) throw error;
      return data?.id || data?.key;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const cleanItem = removeEmptyId(item);

      if (cleanItem.id) {
        cleanItem.id = Number(cleanItem.id);
      }

      const request = store.put(cleanItem);

      request.onsuccess = () => resolve(cleanItem.id || request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    if (this.isSupabaseReady()) {
      const table = TABLE_MAP[storeName];
      const idColumn = storeName === 'settings' ? 'key' : 'id';
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq(idColumn, key);

      if (error) throw error;
      return true;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(Number(key) || key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key, defaultValue) {
    const record = await this.get('settings', key);
    return record ? record.value : defaultValue;
  }

  async setSetting(key, value) {
    if (this.isSupabaseReady()) {
      const { error } = await this.supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;
      return key;
    }

    return this.put('settings', { key, value });
  }

  async clearLocalStores() {
    if (this.isSupabaseReady()) {
      throw new Error('A limpeza total pelo painel foi bloqueada para proteger dados reais no Supabase.');
    }

    const stores = ['products', 'clients', 'expenses', 'settings'];
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    }
  }
}

window.db = new HelpVitallDB();
