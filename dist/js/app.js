/**
 * Help Vitall - App Main Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Database
  try {
    await window.db.init();
    console.log('Database initialized successfully.');
  } catch (err) {
    showToast('Erro ao inicializar o banco de dados local.', 'error');
    console.error(err);
  }

  const DEFAULT_COST_RULES = [
    // VitalMax Rules
    {
      productName: 'VitalMax',
      formulaCode: 'ME FS-MALE-60-150BBBC',
      bottleQuantity: 1,
      costPerBottle: 3.21,
      bottlesCost: 3.21,
      weight: '3.5 oz',
      packagingCost: 0.15,
      handlingCost: 0.75,
      estimatedShipping: 4.36,
      estimatedTotalCost: 8.47,
      averageCost: 8.29,
      active: true
    },
    {
      productName: 'VitalMax',
      formulaCode: 'ME FS-MALE-60-150BBBC',
      bottleQuantity: 3,
      costPerBottle: 3.21,
      bottlesCost: 9.63,
      weight: '10 oz',
      packagingCost: 0.15,
      handlingCost: 1.25,
      estimatedShipping: 5.62,
      estimatedTotalCost: 16.65,
      averageCost: 15.21,
      active: true
    },
    {
      productName: 'VitalMax',
      formulaCode: 'ME FS-MALE-60-150BBBC',
      bottleQuantity: 6,
      costPerBottle: 3.21,
      bottlesCost: 19.26,
      weight: '1.25 lbs',
      packagingCost: 0.15,
      handlingCost: 2.00,
      estimatedShipping: 8.91,
      estimatedTotalCost: 30.32,
      averageCost: 25.59,
      active: true
    },
    {
      productName: 'VitalMax',
      formulaCode: 'ME FS-MALE-60-150BBBC',
      bottleQuantity: 9,
      costPerBottle: 3.21,
      bottlesCost: 28.89,
      weight: '1.875 lbs',
      packagingCost: 0.15,
      handlingCost: 2.75,
      estimatedShipping: 8.91,
      estimatedTotalCost: 40.70,
      averageCost: 35.97,
      active: true
    },
    {
      productName: 'VitalMax',
      formulaCode: 'ME FS-MALE-60-150BBBC',
      bottleQuantity: 12,
      costPerBottle: 3.21,
      bottlesCost: 38.52,
      weight: '2.5 lbs',
      packagingCost: 0.15,
      handlingCost: 3.50,
      estimatedShipping: 10.42,
      estimatedTotalCost: 52.59,
      averageCost: 46.35,
      active: true
    },
    // ArtroFlex Rules
    {
      productName: 'ArtroFlex',
      formulaCode: 'Turmeric FS-TURMERIC-30-150WBWC',
      bottleQuantity: 1,
      costPerBottle: 3.50,
      bottlesCost: 3.50,
      weight: '3.5 oz',
      packagingCost: 0.15,
      handlingCost: 0.75,
      estimatedShipping: 4.36,
      estimatedTotalCost: 8.76,
      averageCost: 8.58,
      active: true
    },
    {
      productName: 'ArtroFlex',
      formulaCode: 'Turmeric FS-TURMERIC-30-150WBWC',
      bottleQuantity: 3,
      costPerBottle: 3.50,
      bottlesCost: 10.50,
      weight: '10 oz',
      packagingCost: 0.15,
      handlingCost: 1.25,
      estimatedShipping: 5.62,
      estimatedTotalCost: 17.52,
      averageCost: 16.08,
      active: true
    },
    {
      productName: 'ArtroFlex',
      formulaCode: 'Turmeric FS-TURMERIC-30-150WBWC',
      bottleQuantity: 6,
      costPerBottle: 3.50,
      bottlesCost: 21.00,
      weight: '1.25 lbs',
      packagingCost: 0.15,
      handlingCost: 2.00,
      estimatedShipping: 8.91,
      estimatedTotalCost: 32.06,
      averageCost: 27.33,
      active: true
    },
    {
      productName: 'ArtroFlex',
      formulaCode: 'Turmeric FS-TURMERIC-30-150WBWC',
      bottleQuantity: 9,
      costPerBottle: 3.50,
      bottlesCost: 31.50,
      weight: '1.875 lbs',
      packagingCost: 0.15,
      handlingCost: 2.75,
      estimatedShipping: 8.91,
      estimatedTotalCost: 43.31,
      averageCost: 38.58,
      active: true
    },
    {
      productName: 'ArtroFlex',
      formulaCode: 'Turmeric FS-TURMERIC-30-150WBWC',
      bottleQuantity: 12,
      costPerBottle: 3.50,
      bottlesCost: 42.00,
      weight: '2.5 lbs',
      packagingCost: 0.15,
      handlingCost: 3.50,
      estimatedShipping: 10.42,
      estimatedTotalCost: 56.07,
      averageCost: 49.83,
      active: true
    }
  ];

  function normalizeProductName(name) {
    return normalizeImportText(name).replace(/\s+/g, '');
  }

  function findCostRule(productName, bottles) {
    if (!productName) return null;
    const cleanProd = normalizeProductName(productName);
    const count = Number(bottles) || 0;
    const rules = state.productCostRules || [];
    let rule = rules.find(r => normalizeProductName(r.productName) === cleanProd && Number(r.bottleQuantity) === count && r.active);
    if (!rule) {
      rule = DEFAULT_COST_RULES.find(r => normalizeProductName(r.productName) === cleanProd && Number(r.bottleQuantity) === count);
    }
    return rule;
  }

  async function syncAutoExpenseForClient(client, source = 'manual') {
    if (!client || !client.id) return;
    if (authState.user && authState.user.role === 'funcionario') return;

    // Find the product name
    const product = state.products.find(p => p.id === client.productId);
    const productName = product ? product.name : (client.productName || '');
    
    // Find the cost rule
    const rule = findCostRule(productName, client.bottles);

    // Find if there is an existing auto expense for this client
    let existingExpense = state.expenses.find(e => 
      e.clientId === client.id || 
      (e.observation && e.observation.includes(`[AUTO_EXPENSE_CLIENT_ID:${client.id}]`))
    );

    if (!rule) {
      if (existingExpense) {
        await window.db.delete('expenses', existingExpense.id);
        state.expenses = state.expenses.filter(e => e.id !== existingExpense.id);
      }
      return;
    }

    const expenseData = {
      id: existingExpense ? existingExpense.id : undefined,
      name: `Custo automático do pedido - Cliente: ${client.name}`,
      category: 'Custo do pedido',
      value: rule.estimatedTotalCost,
      date: client.paymentDate || client.date || new Date().toISOString().slice(0, 10),
      productId: client.productId,
      observation: `Custo automático do pedido - Cliente: ${client.name} | Potes: ${client.bottles} | Custo dos potes: ${rule.bottlesCost} | Embalagem: ${rule.packagingCost} | Handling: ${rule.handlingCost} | Envio: ${rule.estimatedShipping} [AUTO_EXPENSE_CLIENT_ID:${client.id}]`,
      clientId: client.id,
      autoGenerated: true,
      source: source
    };

    if (existingExpense) {
      await window.db.put('expenses', expenseData);
    } else {
      const newId = await window.db.add('expenses', expenseData);
      expenseData.id = newId;
    }

    state.expenses = await window.db.getAll('expenses');
  }

  // State Management
  const state = {
    currentView: 'dashboard',
    products: [],
    clients: [],
    expenses: [],
    productCostRules: [],
    settings: {
      theme: 'system',
      systemName: 'Help Vitall'
    },
    // Temp variables for edits
    editingProductId: null,
    editingClientId: null,
    editingExpenseId: null
  };

  // Auth State Management
  const authState = {
    user: null,
    loading: false
  };

  // DOM Elements
  const elements = {
    // Navigation
    sidebarItems: document.querySelectorAll('.sidebar-item'),
    pageViews: document.querySelectorAll('.page-view'),
    currentViewTitle: document.getElementById('currentViewTitle'),
    sidebarSystemName: document.getElementById('sidebarSystemName'),
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),

    // Dashboard Filters
    dashboardPeriodFilter: document.getElementById('dashboardPeriodFilter'),
    customDateRangeWrapper: document.getElementById('customDateRangeWrapper'),
    dashboardStartDate: document.getElementById('dashboardStartDate'),
    dashboardEndDate: document.getElementById('dashboardEndDate'),
    dashboardProductFilter: document.getElementById('dashboardProductFilter'),
    dashboardChartContainer: document.getElementById('dashboardChartContainer'),
    dashboardProductTableBody: document.getElementById('dashboardProductTableBody'),

    // Reports View Filters
    reportsPeriodFilter: document.getElementById('reportsPeriodFilter'),
    reportsCustomDateRangeWrapper: document.getElementById('reportsCustomDateRangeWrapper'),
    reportsStartDate: document.getElementById('reportsStartDate'),
    reportsEndDate: document.getElementById('reportsEndDate'),
    productReportsGrid: document.getElementById('productReportsGrid'),
    reportsEmptyState: document.getElementById('reportsEmptyState'),

    // KPIs
    kpiRevenueVal: document.getElementById('kpiRevenueVal'),
    kpiProfitVal: document.getElementById('kpiProfitVal'),
    kpiExpensesVal: document.getElementById('kpiExpensesVal'),
    kpiLossVal: document.getElementById('kpiLossVal'),
    kpiPaidClientsVal: document.getElementById('kpiPaidClientsVal'),
    kpiPendingClientsVal: document.getElementById('kpiPendingClientsVal'),
    kpiScamClientsVal: document.getElementById('kpiScamClientsVal'),
    kpiAvgTicketVal: document.getElementById('kpiAvgTicketVal'),

    // Client Page & CRUD
    searchClientsInput: document.getElementById('searchClientsInput'),
    btnOpenAddClientModal: document.getElementById('btnOpenAddClientModal'),
    clientsTableBody: document.getElementById('clientsTableBody'),
    clientModal: document.getElementById('clientModal'),
    clientForm: document.getElementById('clientForm'),
    clientId: document.getElementById('clientId'),
    clientName: document.getElementById('clientName'),
    clientPhone: document.getElementById('clientPhone'),
    clientCountry: document.getElementById('clientCountry'),
    clientZip: document.getElementById('clientZip'),
    clientAddress: document.getElementById('clientAddress'),
    clientCity: document.getElementById('clientCity'),
    clientState: document.getElementById('clientState'),
    clientProduct: document.getElementById('clientProduct'),
    clientPlan: document.getElementById('clientPlan'),
    clientSaleValue: document.getElementById('clientSaleValue'),
    clientBottles: document.getElementById('clientBottles'),
    clientAttendant: document.getElementById('clientAttendant'),
    clientDate: document.getElementById('clientDate'),
    clientStatus: document.getElementById('clientStatus'),
    clientObservations: document.getElementById('clientObservations'),
    clientTrackingCode: document.getElementById('clientTrackingCode'),
    clientDeliveryDate: document.getElementById('clientDeliveryDate'),
    clientSent: document.getElementById('clientSent'),
    clientDelivered: document.getElementById('clientDelivered'),
    clientPaymentDate: document.getElementById('clientPaymentDate'),
    clientPaymentMethod: document.getElementById('clientPaymentMethod'),
    btnCancelClientModal: document.getElementById('btnCancelClientModal'),
    btnCloseClientModal: document.getElementById('btnCloseClientModal'),
    clientModalTitle: document.getElementById('clientModalTitle'),

    // Product Page & CRUD
    searchProductsInput: document.getElementById('searchProductsInput'),
    btnOpenAddProductModal: document.getElementById('btnOpenAddProductModal'),
    productsTableBody: document.getElementById('productsTableBody'),
    productModal: document.getElementById('productModal'),
    productForm: document.getElementById('productForm'),
    prodId: document.getElementById('prodId'),
    prodName: document.getElementById('prodName'),
    prodNiche: document.getElementById('prodNiche'),
    prodCost: document.getElementById('prodCost'),
    prodStatus: document.getElementById('prodStatus'),
    prodAttendants: document.getElementById('prodAttendants'),
    plansListWrapper: document.getElementById('plansListWrapper'),
    btnAddPlanItem: document.getElementById('btnAddPlanItem'),
    btnCancelProductModal: document.getElementById('btnCancelProductModal'),
    btnCloseProductModal: document.getElementById('btnCloseProductModal'),
    productModalTitle: document.getElementById('productModalTitle'),

    // Expense Page & CRUD
    searchExpensesInput: document.getElementById('searchExpensesInput'),
    filterExpenseType: document.getElementById('filterExpenseType'),
    filterExpenseProduct: document.getElementById('filterExpenseProduct'),
    filterExpenseClient: document.getElementById('filterExpenseClient'),
    filterExpenseAttendant: document.getElementById('filterExpenseAttendant'),
    filterExpenseBottles: document.getElementById('filterExpenseBottles'),
    filterExpensePeriod: document.getElementById('filterExpensePeriod'),
    filterExpenseStartDate: document.getElementById('filterExpenseStartDate'),
    filterExpenseEndDate: document.getElementById('filterExpenseEndDate'),
    btnOpenAddExpenseModal: document.getElementById('btnOpenAddExpenseModal'),
    expensesTableBody: document.getElementById('expensesTableBody'),
    expenseModal: document.getElementById('expenseModal'),
    expenseForm: document.getElementById('expenseForm'),
    expenseId: document.getElementById('expenseId'),
    expenseName: document.getElementById('expenseName'),
    expenseCategory: document.getElementById('expenseCategory'),
    expenseValue: document.getElementById('expenseValue'),
    expenseDate: document.getElementById('expenseDate'),
    expenseProduct: document.getElementById('expenseProduct'),
    expenseObs: document.getElementById('expenseObs'),
    btnCancelExpenseModal: document.getElementById('btnCancelExpenseModal'),
    btnCloseExpenseModal: document.getElementById('btnCloseExpenseModal'),
    expenseModalTitle: document.getElementById('expenseModalTitle'),

    // Settings
    settingsForm: document.getElementById('settingsForm'),
    settingsSystemName: document.getElementById('settingsSystemName'),
    settingsEmployeeEditClients: document.getElementById('settingsEmployeeEditClients'),
    settingsEmployeeSeeAllClients: document.getElementById('settingsEmployeeSeeAllClients'),
    btnResetDatabase: document.getElementById('btnResetDatabase'),
    themeOptLight: document.getElementById('themeOptLight'),
    themeOptDark: document.getElementById('themeOptDark'),
    themeOptSystem: document.getElementById('themeOptSystem'),

    // Import Modal
    importModal: document.getElementById('importModal'),
    btnOpenImportModal: document.getElementById('btnOpenImportModal'),
    btnCloseImportModal: document.getElementById('btnCloseImportModal'),
    btnCancelImport: document.getElementById('btnCancelImport'),
    btnImportBack: document.getElementById('btnImportBack'),
    btnImportNext: document.getElementById('btnImportNext'),
    importFile: document.getElementById('importFile'),
    dropZone: document.getElementById('dropZone'),
    selectedFileInfo: document.getElementById('selectedFileInfo'),
    importGSheetsUrl: document.getElementById('importGSheetsUrl'),
    btnLoadGSheets: document.getElementById('btnLoadGSheets'),
    importDefaultProduct: document.getElementById('importDefaultProduct'),
    importDefaultPlan: document.getElementById('importDefaultPlan'),
    mappingFieldsContainer: document.getElementById('mappingFieldsContainer'),
    importDuplicateAction: document.getElementById('importDuplicateAction'),
    importPreviewTableBody: document.getElementById('importPreviewTableBody'),
    previewDuplicatesCount: document.getElementById('previewDuplicatesCount'),
    importWarningsBox: document.getElementById('importWarningsBox'),
    importWarningsList: document.getElementById('importWarningsList'),
    importRefMonth: document.getElementById('importRefMonth'),
    importRefYear: document.getElementById('importRefYear'),
    importDetectedMonthYear: document.getElementById('importDetectedMonthYear'),
    importSummaryPaid: document.getElementById('importSummaryPaid'),
    importSummaryPending: document.getElementById('importSummaryPending'),
    importSummaryLoss: document.getElementById('importSummaryLoss'),
    importSummaryRevenue: document.getElementById('importSummaryRevenue'),
    importSummaryLossVal: document.getElementById('importSummaryLossVal'),
    importSummaryDatesRange: document.getElementById('importSummaryDatesRange'),
    importSummaryPlan2: document.getElementById('importSummaryPlan2'),
    importSummaryPlan3: document.getElementById('importSummaryPlan3'),
    importSummaryPlan4: document.getElementById('importSummaryPlan4'),
    importSummaryPlan6: document.getElementById('importSummaryPlan6'),
    importSummaryPlanUnknown: document.getElementById('importSummaryPlanUnknown'),
    sumTotalImported: document.getElementById('sumTotalImported'),
    sumPaid: document.getElementById('sumPaid'),
    sumPending: document.getElementById('sumPending'),
    sumScams: document.getElementById('sumScams'),
    sumRevenue: document.getElementById('sumRevenue'),
    sumLoss: document.getElementById('sumLoss'),
    sumErrors: document.getElementById('sumErrors'),

    // Authentication
    loginContainer: document.getElementById('loginContainer'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginErrorMsg: document.getElementById('loginErrorMsg'),
    btnLoginSubmit: document.getElementById('btnLoginSubmit'),
    loginSpinner: document.getElementById('loginSpinner'),
    headerUserProfile: document.getElementById('headerUserProfile'),
    headerUserEmail: document.getElementById('headerUserEmail'),
    headerUserRole: document.getElementById('headerUserRole'),
    btnHeaderLogout: document.getElementById('btnHeaderLogout'),
    mainContainer: document.getElementById('mainContainer'),
    sidebar: document.getElementById('sidebar'),

    // Employee Management Elements
    searchEmployeesInput: document.getElementById('searchEmployeesInput'),
    btnOpenAddEmployeeModal: document.getElementById('btnOpenAddEmployeeModal'),
    employeesTableBody: document.getElementById('employeesTableBody'),
    employeeModal: document.getElementById('employeeModal'),
    employeeForm: document.getElementById('employeeForm'),
    employeeId: document.getElementById('employeeId'),
    employeeName: document.getElementById('employeeName'),
    employeeEmail: document.getElementById('employeeEmail'),
    employeePhone: document.getElementById('employeePhone'),
    employeePosition: document.getElementById('employeePosition'),
    employeeStatus: document.getElementById('employeeStatus'),
    employeePassword: document.getElementById('employeePassword'),
    employeeConfirmPassword: document.getElementById('employeeConfirmPassword'),
    btnCancelEmployeeModal: document.getElementById('btnCancelEmployeeModal'),
    btnCloseEmployeeModal: document.getElementById('btnCloseEmployeeModal'),
    employeeModalTitle: document.getElementById('employeeModalTitle'),
    supabaseEmployeeAlert: document.getElementById('supabaseEmployeeAlert'),
    employeePasswordSection: document.getElementById('employeePasswordSection'),

    // General Containers
    toastContainer: document.getElementById('toastContainer')
  };

  // Helper: Format values to Currency (USD by default, formatted professionally)
  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  }

  // Helper: Escape HTML strings to prevent XSS injection
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Helper: Get ISO Date String (YYYY-MM-DD) from Date object
  function getISODateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper: Parse Date locally to avoid TZ shifting
  function parseLocalDate(dateString) {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Helper: Get effective date for client based on their status
  function getClientEffectiveDate(client) {
    if (!client) return '';
    if (client.status === 'Pago') {
      return client.paymentDate || client.date;
    }
    if (client.status === 'Golpe') {
      return client.deliveryDate || client.date;
    }
    return client.date;
  }

  // Helper: Format date string to display (DD/MM/YYYY)
  function formatDateDisplay(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  function formatDateTimeLabel(value, fallback = '-') {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // ==========================================================================
  // TOAST NOTIFICATION UTILITY
  // ==========================================================================
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    
    let icon = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    if (type === 'error') {
      icon = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    }

    toast.innerHTML = `${icon}<span>${escapeHTML(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Add styles for toast fadeOut dynamically
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(10px); } }`;
  document.head.appendChild(styleSheet);

  // ==========================================================================
  // ROUTING & NAVIGATION
  // ==========================================================================
  function navigateTo(viewId) {
    if (!authState.user) {
      showLoginScreen();
      return;
    }

    // Role-based redirect and authorization
    const role = authState.user.role || 'funcionario';
    if (role === 'funcionario') {
      if (viewId === 'dashboard') {
        viewId = 'employee-dashboard';
      }
      const allowedViews = ['employee-dashboard', 'clients'];
      if (!allowedViews.includes(viewId)) {
        viewId = 'employee-dashboard';
      }
    } else {
      if (viewId === 'employee-dashboard') {
        viewId = 'dashboard';
      }
    }

    state.currentView = viewId;
    
    // Toggle active classes on sidebar
    elements.sidebarItems.forEach(item => {
      const itemView = item.getAttribute('data-view');
      if (itemView === viewId || (itemView === 'dashboard' && viewId === 'employee-dashboard')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle active view sections
    elements.pageViews.forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Set page title
    const viewTitleMap = {
      'dashboard': 'Dashboard',
      'employee-dashboard': 'Painel do Funcionário',
      'clients': 'Gestão de Clientes',
      'products': 'Gestão de Produtos',
      'expenses': 'Gestão de Despesas',
      'reports': 'Desempenho por Produto',
      'settings': 'Configurações do Sistema',
      'employees': 'Gestão de Funcionários'
    };
    elements.currentViewTitle.textContent = viewTitleMap[viewId] || 'Help Vitall';

    // Close mobile menu if open
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarOverlay.style.display = 'none';

    // Reload content for that view
    loadViewData(viewId);
  }

  // Sidebar navigation click handler
  elements.sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      navigateTo(view);
    });
  });

  // Mobile sidebar controls
  elements.menuToggle.addEventListener('click', () => {
    elements.sidebar.classList.add('mobile-open');
    elements.sidebarOverlay.style.display = 'block';
  });

  elements.sidebarOverlay.addEventListener('click', () => {
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarOverlay.style.display = 'none';
  });

  // ==========================================================================
  // CONFIGURATION & THEME SYSTEM
  // ==========================================================================
  async function loadSettings() {
    state.settings.theme = await window.db.getSetting('theme', 'system');
    state.settings.systemName = await window.db.getSetting('systemName', 'Help Vitall');
    state.settings.employeeEditClients = await window.db.getSetting('employeeEditClients', true);
    state.settings.employeeSeeAllClients = await window.db.getSetting('employeeSeeAllClients', true);

    // Update UI elements
    elements.sidebarSystemName.textContent = state.settings.systemName;
    elements.settingsSystemName.value = state.settings.systemName;
    if (elements.settingsEmployeeEditClients) {
      elements.settingsEmployeeEditClients.checked = state.settings.employeeEditClients;
    }
    if (elements.settingsEmployeeSeeAllClients) {
      elements.settingsEmployeeSeeAllClients.checked = state.settings.employeeSeeAllClients;
    }

    applyTheme(state.settings.theme);
  }

  function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    
    // Highlight settings page card option
    elements.themeOptLight.classList.remove('active');
    elements.themeOptDark.classList.remove('active');
    elements.themeOptSystem.classList.remove('active');

    if (theme === 'light') {
      document.body.classList.add('theme-light');
      elements.themeOptLight.classList.add('active');
    } else if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      elements.themeOptDark.classList.add('active');
    } else {
      elements.themeOptSystem.classList.add('active');
      // For system, default CSS is handles it automatically via @media prefers-color-scheme
    }
  }

  // Theme click selectors
  elements.themeOptLight.addEventListener('click', () => applyThemeSelection('light'));
  elements.themeOptDark.addEventListener('click', () => applyThemeSelection('dark'));
  elements.themeOptSystem.addEventListener('click', () => applyThemeSelection('system'));

  async function applyThemeSelection(theme) {
    state.settings.theme = theme;
    applyTheme(theme);
    await window.db.setSetting('theme', theme);
    showToast('Preferência de tema salva!');
  }

  elements.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let systemName = elements.settingsSystemName.value.trim();
    if (!systemName) {
      systemName = 'Help Vitall';
    }

    state.settings.systemName = systemName;
    elements.sidebarSystemName.textContent = systemName;
    elements.settingsSystemName.value = systemName;
    await window.db.setSetting('systemName', systemName);

    if (elements.settingsEmployeeEditClients) {
      state.settings.employeeEditClients = elements.settingsEmployeeEditClients.checked;
      await window.db.setSetting('employeeEditClients', state.settings.employeeEditClients);
    }
    if (elements.settingsEmployeeSeeAllClients) {
      state.settings.employeeSeeAllClients = elements.settingsEmployeeSeeAllClients.checked;
      await window.db.setSetting('employeeSeeAllClients', state.settings.employeeSeeAllClients);
    }

    showToast('Configurações salvas com sucesso!');
  });

  elements.btnResetDatabase.addEventListener('click', async () => {
    if (window.db.isSupabaseReady && window.db.isSupabaseReady()) {
      showToast('A limpeza total foi bloqueada para proteger os dados reais no Supabase.', 'error');
      return;
    }

    if (confirm('Tem certeza absoluta de que deseja limpar todo o banco de dados? Isso excluirá permanentemente todos os clientes, produtos, despesas e configurações.')) {
      try {
        await window.db.clearLocalStores();
        showToast('Banco de dados redefinido.');
        // Reload settings & navigate to dashboard
        await loadSettings();
        navigateTo('dashboard');
      } catch (err) {
        showToast('Erro ao limpar banco de dados.', 'error');
      }
    }
  });

  // ==========================================================================
  // DATA FILTERING & PERIODS
  // ==========================================================================
  function getDateRange(periodCode, customStartVal, customEndVal) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    let start = new Date(today);
    let end = new Date(endOfToday);

    switch (periodCode) {
      case 'today':
        // Start: today at 00:00:00, End: today at 23:59:59
        break;
      case 'yesterday':
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case '7days':
        start.setDate(today.getDate() - 6);
        break;
      case '14days':
        start.setDate(today.getDate() - 13);
        break;
      case '30days':
        start.setDate(today.getDate() - 29);
        break;
      case 'custom':
        if (customStartVal && customEndVal) {
          start = parseLocalDate(customStartVal);
          end = parseLocalDate(customEndVal);
          end.setHours(23, 59, 59, 999);
        } else {
          // Fallback to last 7 days if inputs are empty
          start.setDate(today.getDate() - 6);
        }
        break;
    }

    return { start, end };
  }

  // Dashboard Filters change event listeners
  elements.dashboardPeriodFilter.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      elements.customDateRangeWrapper.style.display = 'flex';
      // Set defaults for custom date inputs
      const todayStr = getISODateString(new Date());
      elements.dashboardStartDate.value = todayStr;
      elements.dashboardEndDate.value = todayStr;
    } else {
      elements.customDateRangeWrapper.style.display = 'none';
    }
    updateDashboard();
  });

  elements.dashboardStartDate.addEventListener('change', updateDashboard);
  elements.dashboardEndDate.addEventListener('change', updateDashboard);
  elements.dashboardProductFilter.addEventListener('change', updateDashboard);

  // Reports View Filters change event listeners
  elements.reportsPeriodFilter.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      elements.reportsCustomDateRangeWrapper.style.display = 'flex';
      const todayStr = getISODateString(new Date());
      elements.reportsStartDate.value = todayStr;
      elements.reportsEndDate.value = todayStr;
    } else {
      elements.reportsCustomDateRangeWrapper.style.display = 'none';
    }
    updateReportsView();
  });
  
  elements.reportsStartDate.addEventListener('change', updateReportsView);
  elements.reportsEndDate.addEventListener('change', updateReportsView);

  // ==========================================================================
  // VIEW INGESTION & CENTRAL LOADER
  // ==========================================================================
  async function loadViewData(viewId) {
    // Fetch fresh datasets
    try {
      const isAdmin = authState.user && authState.user.role === 'admin';
      state.products = await window.db.getAll('products');
      state.clients = await window.db.getAll('clients');
      state.expenses = isAdmin ? await window.db.getAll('expenses') : [];
      state.profiles = isAdmin ? await window.db.getAll('profiles') : state.profiles;
      state.activityLogs = isAdmin ? await window.db.getAll('employee_activity_logs') : [];
    } catch (err) {
      console.error("Error fetching data from database:", err);
      showToast("Falha ao sincronizar dados com o banco.", "error");
    }

    switch (viewId) {
      case 'dashboard':
        populateDashboardFilters();
        updateDashboard();
        break;
      case 'employee-dashboard':
        populateEmployeeDashboardFilters();
        updateEmployeeDashboard();
        break;
      case 'clients':
        populateProductDropdowns();
        renderClientsList();
        break;
      case 'products':
        renderProductsList();
        break;
      case 'expenses':
        populateProductDropdowns();
        populateExpenseFilters();
        renderExpensesList();
        break;
      case 'reports':
        updateReportsView();
        break;
      case 'settings':
        // Handled in loadSettings
        break;
      case 'employees':
        renderEmployeesList();
        break;
    }
  }

  // Populate Dashboard Product dropdown & Date defaults
  function populateDashboardFilters() {
    const prevSelected = elements.dashboardProductFilter.value;
    
    // Clear and build options
    elements.dashboardProductFilter.innerHTML = '<option value="all">Todos os produtos</option>';
    state.products.forEach(prod => {
      const opt = document.createElement('option');
      opt.value = prod.id;
      opt.textContent = prod.name;
      elements.dashboardProductFilter.appendChild(opt);
    });

    // Restore selection if existed
    if (state.products.some(p => p.id == prevSelected)) {
      elements.dashboardProductFilter.value = prevSelected;
    } else {
      elements.dashboardProductFilter.value = 'all';
    }
  }

  // Populate Products options in forms and filters
  function populateProductDropdowns() {
    // Client Modal Products select
    elements.clientProduct.innerHTML = '<option value="" disabled selected>Selecione um produto</option>';
    
    // Expense Modal Product select
    elements.expenseProduct.innerHTML = '<option value="">Nenhum</option>';

    state.products.filter(p => p.status === 'active').forEach(prod => {
      // For Client Modal
      const opt1 = document.createElement('option');
      opt1.value = prod.id;
      opt1.textContent = prod.name;
      elements.clientProduct.appendChild(opt1);

      // For Expense Modal
      const opt2 = document.createElement('option');
      opt2.value = prod.id;
      opt2.textContent = prod.name;
      elements.expenseProduct.appendChild(opt2);
    });
  }

  // ==========================================================================
  // DASHBOARD LOGIC (KPIs, Charts, Product table)
  // ==========================================================================
  function updateDashboard() {
    // 1. Calculate Date Filters
    const period = elements.dashboardPeriodFilter.value;
    const startVal = elements.dashboardStartDate.value;
    const endVal = elements.dashboardEndDate.value;
    const { start, end } = getDateRange(period, startVal, endVal);

    // 2. Calculate Product Filters
    const productFilterVal = elements.dashboardProductFilter.value; // 'all' or product ID

    // 3. Filter Datasets
    // Filter clients based on Date range and Product filter
    const filteredClients = state.clients.filter(client => {
      const regDate = parseLocalDate(getClientEffectiveDate(client));
      const inDateRange = regDate >= start && regDate <= end;
      const matchesProduct = productFilterVal === 'all' || String(client.productId) === productFilterVal;
      return inDateRange && matchesProduct;
    });

    // Filter expenses based on Date range and Product filter
    const filteredExpenses = state.expenses.filter(exp => {
      const expDate = parseLocalDate(exp.date);
      const inDateRange = expDate >= start && expDate <= end;
      const matchesProduct = productFilterVal === 'all' || (exp.productId && String(exp.productId) === productFilterVal);
      return inDateRange && matchesProduct;
    });

    // 4. Calculate Financial Statistics
    let faturamento = 0; // clients.status == Pago
    let prejuizo = 0;    // clients.status == Golpe
    let totalGastos = 0; // expenses
    let countPago = 0;
    let countPendente = 0;
    let countGolpe = 0;

    filteredClients.forEach(c => {
      const val = Number(c.saleValue) || 0;
      if (c.status === 'Pago') {
        faturamento += val;
        countPago++;
      } else if (c.status === 'Golpe') {
        prejuizo += val;
        countGolpe++;
      } else if (c.status === 'Pagamento pendente') {
        countPendente++;
      }
    });

    filteredExpenses.forEach(exp => {
      totalGastos += Number(exp.value) || 0;
    });

    // Lucro Líquido = faturamento - totalGastos - prejuizo
    const lucroLiquido = faturamento - totalGastos - prejuizo;
    const ticketMedio = countPago > 0 ? (faturamento / countPago) : 0;

    // Render KPIs
    elements.kpiRevenueVal.textContent = formatCurrency(faturamento);
    
    elements.kpiProfitVal.textContent = formatCurrency(lucroLiquido);
    elements.kpiProfitVal.className = 'kpi-value ' + (lucroLiquido >= 0 ? 'text-success' : 'text-danger');
    
    elements.kpiExpensesVal.textContent = formatCurrency(totalGastos);
    
    elements.kpiLossVal.textContent = formatCurrency(prejuizo);
    
    elements.kpiPaidClientsVal.textContent = countPago;
    elements.kpiPendingClientsVal.textContent = countPendente;
    elements.kpiScamClientsVal.textContent = countGolpe;
    elements.kpiAvgTicketVal.textContent = formatCurrency(ticketMedio);

    // 5. Render Chart
    renderFinancialChart(start, end, filteredClients, filteredExpenses);

    // 6. Render Product Performance List Table
    renderProductPerformanceTable(start, end);
  }

  // Dynamic SVG Chart Engine
  function renderFinancialChart(start, end, filteredClients, filteredExpenses) {
    const container = elements.dashboardChartContainer;
    container.innerHTML = ''; // reset

    // Build lists of dates within this range
    const dateList = [];
    const current = new Date(start);
    while (current <= end) {
      dateList.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    if (dateList.length === 0) {
      container.innerHTML = `<div class="chart-empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Nenhum período selecionado</div>`;
      return;
    }

    // Accumulate daily stats
    const dailyData = dateList.map(date => {
      const dateStr = getISODateString(date);

      // Clients registered/paid on this day
      const dayClients = filteredClients.filter(c => getClientEffectiveDate(c) === dateStr);
      let dayFaturamento = 0;
      let dayPrejuizo = 0;
      dayClients.forEach(c => {
        const val = Number(c.saleValue) || 0;
        if (c.status === 'Pago') dayFaturamento += val;
        else if (c.status === 'Golpe') dayPrejuizo += val;
      });

      // Expenses registered on this day
      const dayExpenses = filteredExpenses.filter(e => e.date === dateStr);
      let dayGastos = 0;
      dayExpenses.forEach(e => {
        dayGastos += Number(e.value) || 0;
      });

      const dayProfit = dayFaturamento - dayGastos - dayPrejuizo;

      return {
        dateStr,
        displayDate: formatDateDisplay(dateStr),
        faturamento: dayFaturamento,
        gastos: dayGastos,
        prejuizo: dayPrejuizo,
        profit: dayProfit
      };
    });

    // Check if there is any financial activity in the selected range
    const hasData = dailyData.some(d => d.faturamento > 0 || d.gastos > 0 || d.prejuizo > 0);
    if (!hasData) {
      container.innerHTML = `
        <div class="chart-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Nenhuma transação ou despesa registrada neste período
        </div>`;
      return;
    }

    // Chart Dimensions
    const width = container.clientWidth || 800;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 60 };

    // Find Max absolute profit to set Y Scale symmetrically
    const maxVal = Math.max(...dailyData.map(d => Math.abs(d.profit)), 100);

    // Render SVG
    let svgContent = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%">`;
    
    // Axes line & Baseline (0 profit)
    const zeroY = padding.top + (height - padding.top - padding.bottom) / 2;
    const graphHeight = height - padding.top - padding.bottom;
    const graphWidth = width - padding.left - padding.right;

    // Grid lines Y-axis
    const gridLines = 5;
    for (let i = 0; i < gridLines; i++) {
      const yVal = padding.top + (graphHeight / (gridLines - 1)) * i;
      const profitLabel = maxVal - ((maxVal * 2) / (gridLines - 1)) * i;
      svgContent += `
        <line x1="${padding.left}" y1="${yVal}" x2="${width - padding.right}" y2="${yVal}" stroke="var(--border-color)" stroke-dasharray="4,4" stroke-width="1" />
        <text x="${padding.left - 10}" y="${yVal + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end">${formatCurrency(profitLabel)}</text>
      `;
    }

    // Draw baseline 0 (darker line)
    svgContent += `<line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.6"/>`;

    // Compute Bar spacing
    const barWidth = Math.max(2, Math.min(40, (graphWidth / dailyData.length) * 0.6));
    const step = graphWidth / dailyData.length;

    // Draw bars
    dailyData.forEach((day, index) => {
      const x = padding.left + step * index + (step - barWidth) / 2;
      const profitHeight = (Math.abs(day.profit) / maxVal) * (graphHeight / 2);
      
      let y = zeroY;
      let barH = profitHeight;
      let barClass = 'legend-green';
      let fillColor = 'var(--color-green-500)';

      if (day.profit >= 0) {
        y = zeroY - profitHeight;
        fillColor = 'var(--color-green-500)';
      } else {
        y = zeroY;
        fillColor = 'var(--color-red-500)';
      }

      // Safeguard height
      if (barH < 2) barH = 2; // minimum visual bar height

      // Draw SVG Rect
      svgContent += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="${fillColor}" opacity="0.85" style="cursor: pointer; transition: opacity 0.15s;" 
          data-date="${day.displayDate}"
          data-profit="${formatCurrency(day.profit)}"
          data-fat="${formatCurrency(day.faturamento)}"
          data-gastos="${formatCurrency(day.gastos)}"
          data-prej="${formatCurrency(day.prejuizo)}"
          class="chart-bar-rect"
        />
      `;

      // Date labels on X Axis (conditionally to prevent cluttering)
      const showLabelEvery = Math.ceil(dailyData.length / 10);
      if (index % showLabelEvery === 0 || dailyData.length <= 10) {
        // Format to simple day/month
        const dateParts = day.dateStr.split('-');
        const shortDate = `${dateParts[2]}/${dateParts[1]}`;
        svgContent += `
          <text x="${x + barWidth / 2}" y="${height - 15}" fill="var(--text-muted)" font-size="9" text-anchor="middle">${shortDate}</text>
        `;
      }
    });

    svgContent += `</svg>`;
    container.innerHTML = svgContent;

    // Tooltip Element Setup
    let tooltip = document.getElementById('chartTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chartTooltip';
      tooltip.className = 'chart-tooltip';
      document.body.appendChild(tooltip);
    }

    // Attach Event Listeners on dynamically added SVG Bars
    const bars = container.querySelectorAll('.chart-bar-rect');
    bars.forEach(bar => {
      bar.addEventListener('mouseenter', (e) => {
        const rect = e.target;
        rect.setAttribute('opacity', '1');

        const date = rect.getAttribute('data-date');
        const profit = rect.getAttribute('data-profit');
        const fat = rect.getAttribute('data-fat');
        const gastos = rect.getAttribute('data-gastos');
        const prej = rect.getAttribute('data-prej');

        tooltip.innerHTML = `
          <div class="chart-tooltip-title">${date}</div>
          <div class="chart-tooltip-row"><span>Faturamento:</span> <strong>${fat}</strong></div>
          <div class="chart-tooltip-row"><span>Gastos:</span> <strong>${gastos}</strong></div>
          <div class="chart-tooltip-row"><span>Prejuízos:</span> <strong>${prej}</strong></div>
          <div class="chart-tooltip-row" style="border-top:1px solid var(--border-color); margin-top:4px; padding-top:4px;">
            <span>Lucro Líquido:</span> <strong class="${profit.includes('-') ? 'text-danger' : 'text-success'}">${profit}</strong>
          </div>
        `;
        tooltip.style.opacity = '1';
      });

      bar.addEventListener('mousemove', (e) => {
        tooltip.style.left = `${e.pageX + 15}px`;
        tooltip.style.top = `${e.pageY - 60}px`;
      });

      bar.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('opacity', '0.85');
        tooltip.style.opacity = '0';
      });
    });
  }

  // Dashboard Product performance table
  function renderProductPerformanceTable(start, end) {
    const tableBody = elements.dashboardProductTableBody;
    tableBody.innerHTML = '';

    if (state.products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" class="table-empty">Nenhum produto cadastrado</td></tr>`;
      return;
    }

    let hasCalculations = false;
    
    // Accumulate performance per product
    const productReports = state.products.map(prod => {
      // Filter clients in date range for this product
      const prodClients = state.clients.filter(c => {
        const regDate = parseLocalDate(getClientEffectiveDate(c));
        return String(c.productId) === String(prod.id) && regDate >= start && regDate <= end;
      });

      // Filter expenses in date range for this product
      const prodExpenses = state.expenses.filter(e => {
        const expDate = parseLocalDate(e.date);
        return e.productId && String(e.productId) === String(prod.id) && expDate >= start && expDate <= end;
      });

      let faturamento = 0;
      let prejuizos = 0;
      let countPago = 0;
      let countPendente = 0;
      let countGolpes = 0;

      prodClients.forEach(c => {
        const val = Number(c.saleValue) || 0;
        if (c.status === 'Pago') {
          faturamento += val;
          countPago++;
        } else if (c.status === 'Golpe') {
          prejuizos += val;
          countGolpes++;
        } else if (c.status === 'Pagamento pendente') {
          countPendente++;
        }
      });

      // Automatic order costs are stored as expenses, so this must not add the old fixed product cost again.
      const gastosRelacionados = prodExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

      const lucroLiquido = faturamento - gastosRelacionados - prejuizos;

      if (faturamento > 0 || gastosRelacionados > 0 || prejuizos > 0 || countPendente > 0) {
        hasCalculations = true;
      }

      return {
        name: prod.name,
        nicho: prod.nicho,
        countPago,
        countPendente,
        countGolpes,
        faturamento,
        gastosRelacionados,
        prejuizos,
        lucroLiquido
      };
    });

    // If there is no activity for any product in the filtered period, show message
    if (!hasCalculations) {
      tableBody.innerHTML = `<tr><td colspan="9" class="table-empty">Nenhum dado encontrado para o período selecionado</td></tr>`;
      return;
    }

    // Sort by profit descending
    productReports.sort((a, b) => b.lucroLiquido - a.lucroLiquido);

    productReports.forEach(rep => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(rep.name)}</strong></td>
        <td>${escapeHTML(rep.nicho)}</td>
        <td><span class="badge badge-success">${rep.countPago}</span></td>
        <td><span class="badge badge-warning">${rep.countPendente}</span></td>
        <td><span class="badge badge-danger">${rep.countGolpes}</span></td>
        <td>${formatCurrency(rep.faturamento)}</td>
        <td>${formatCurrency(rep.gastosRelacionados)}</td>
        <td>${formatCurrency(rep.prejuizos)}</td>
        <td><span class="${rep.lucroLiquido >= 0 ? 'text-success' : 'text-danger'}" style="font-weight:600;">${formatCurrency(rep.lucroLiquido)}</span></td>
      `;
      tableBody.appendChild(row);
    });
  }

  // ==========================================================================
  // REPORTS VIEW LOGIC
  // ==========================================================================
  function updateReportsView() {
    const period = elements.reportsPeriodFilter.value;
    const startVal = elements.reportsStartDate.value;
    const endVal = elements.reportsEndDate.value;
    const { start, end } = getDateRange(period, startVal, endVal);

    const grid = elements.productReportsGrid;
    
    // Clear items except the empty state element
    const emptyState = elements.reportsEmptyState;
    grid.innerHTML = '';

    if (state.products.length === 0) {
      grid.appendChild(emptyState);
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    state.products.forEach(prod => {
      // Filter clients & expenses for this product in range
      const prodClients = state.clients.filter(c => {
        const regDate = parseLocalDate(getClientEffectiveDate(c));
        return String(c.productId) === String(prod.id) && regDate >= start && regDate <= end;
      });

      const prodExpenses = state.expenses.filter(e => {
        const expDate = parseLocalDate(e.date);
        return e.productId && String(e.productId) === String(prod.id) && expDate >= start && expDate <= end;
      });

      let faturamento = 0;
      let prejuizos = 0;
      let countPago = 0;
      let countPendente = 0;
      let countGolpes = 0;

      prodClients.forEach(c => {
        const val = Number(c.saleValue) || 0;
        if (c.status === 'Pago') {
          faturamento += val;
          countPago++;
        } else if (c.status === 'Golpe') {
          prejuizos += val;
          countGolpes++;
        } else if (c.status === 'Pagamento pendente') {
          countPendente++;
        }
      });

      const gastosRelacionados = prodExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);

      const lucroLiquido = faturamento - gastosRelacionados - prejuizos;

      // Card structure
      const card = document.createElement('div');
      card.className = 'product-report-card';
      card.innerHTML = `
        <div class="prod-card-header">
          <div>
            <h3 class="prod-card-title">${escapeHTML(prod.name)}</h3>
            <span class="prod-card-niche">${escapeHTML(prod.nicho)}</span>
          </div>
          <span class="badge ${prod.status === 'active' ? 'badge-success' : 'badge-neutral'}">${prod.status === 'active' ? 'Ativo' : 'Inativo'}</span>
        </div>
        <div class="prod-metrics-list">
          <div class="prod-metric-row">
            <span class="prod-metric-label">Clientes Pagos:</span>
            <span class="prod-metric-val">${countPago}</span>
          </div>
          <div class="prod-metric-row">
            <span class="prod-metric-label">Clientes Pendentes:</span>
            <span class="prod-metric-val">${countPendente}</span>
          </div>
          <div class="prod-metric-row">
            <span class="prod-metric-label">Golpes / Prejuízos:</span>
            <span class="prod-metric-val">${countGolpes}</span>
          </div>
          <div class="prod-metric-row" style="margin-top: 8px;">
            <span class="prod-metric-label">Faturamento:</span>
            <span class="prod-metric-val text-success">${formatCurrency(faturamento)}</span>
          </div>
          <div class="prod-metric-row">
            <span class="prod-metric-label">Gastos Relacionados:</span>
            <span class="prod-metric-val" style="color: #c2410c;">${formatCurrency(gastosRelacionados)}</span>
          </div>
          <div class="prod-metric-row">
            <span class="prod-metric-label">Prejuízos (Golpes):</span>
            <span class="prod-metric-val text-danger">${formatCurrency(prejuizos)}</span>
          </div>
          <div class="prod-metric-row prod-profit-row">
            <span class="prod-metric-label"><strong>Lucro Líquido:</strong></span>
            <span class="prod-metric-val ${lucroLiquido >= 0 ? 'text-success' : 'text-danger'}"><strong>${formatCurrency(lucroLiquido)}</strong></span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ==========================================================================
  // CLIENTS SECTION (CRUD & Modals)
  // ==========================================================================
  function renderClientsList() {
    const tableBody = elements.clientsTableBody;
    tableBody.innerHTML = '';

    const searchQuery = elements.searchClientsInput.value.toLowerCase().trim();
    const isEmployee = authState.user && authState.user.role === 'funcionario';
    const seeAll = !isEmployee || state.settings.employeeSeeAllClients;
    const canEdit = !isEmployee || state.settings.employeeEditClients;
    const canDelete = !isEmployee;

    // Filter list
    const filtered = state.clients.filter(client => {
      // Check ownership restriction for employee
      if (!seeAll && client.createdById && client.createdById !== authState.user.profileId) {
        return false;
      }

      const matchesSearch = !searchQuery || 
        client.name.toLowerCase().includes(searchQuery) ||
        client.phone.toLowerCase().includes(searchQuery) ||
        client.country.toLowerCase().includes(searchQuery) ||
        client.attendant.toLowerCase().includes(searchQuery);
      return matchesSearch;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="table-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>Nenhum cliente cadastrado</td></tr>`;
      return;
    }

    filtered.forEach(client => {
      const prod = state.products.find(p => String(p.id) === String(client.productId));
      const prodName = prod ? prod.name : 'Produto Desconhecido';

      let statusBadge = 'badge-neutral';
      if (client.status === 'Pago') statusBadge = 'badge-success';
      else if (client.status === 'Golpe') statusBadge = 'badge-danger';
      else if (client.status === 'Pagamento pendente') statusBadge = 'badge-warning';

      let actionsHtml = '';
      if (canEdit) {
        actionsHtml += `
          <button class="btn btn-secondary btn-sm btn-icon-only btn-edit-client" data-id="${client.id}" title="Editar">
            <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        `;
      }
      if (canDelete) {
        actionsHtml += `
          <button class="btn btn-danger btn-sm btn-icon-only btn-delete-client" data-id="${client.id}" title="Excluir">
            <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        `;
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(client.name)}</strong></td>
        <td>${escapeHTML(client.phone)}</td>
        <td>${escapeHTML(client.country)}</td>
        <td>${escapeHTML(prodName)}</td>
        <td>${escapeHTML(client.planName)}</td>
        <td>${formatCurrency(client.saleValue)}</td>
        <td>${escapeHTML(client.attendant)}</td>
        <td>${formatDateDisplay(client.date)}</td>
        <td><span class="badge ${statusBadge}">${escapeHTML(client.status)}</span></td>
        <td>
          <div class="row-actions">
            ${actionsHtml}
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Bind edit/delete handlers
    tableBody.querySelectorAll('.btn-edit-client').forEach(btn => {
      btn.addEventListener('click', () => openClientModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete-client').forEach(btn => {
      btn.addEventListener('click', () => deleteClient(btn.getAttribute('data-id')));
    });
  }

  // Client search listener
  elements.searchClientsInput.addEventListener('input', renderClientsList);

  // Client dropdown change updates plans & attendants
  elements.clientProduct.addEventListener('change', (e) => {
    const productId = e.target.value;
    updateClientModalProductDetails(productId);
  });

  function updateClientModalProductDetails(productId, selectedPlan = null, selectedAttendant = null) {
    const product = state.products.find(p => String(p.id) === String(productId));
    
    if (!product) {
      elements.clientPlan.innerHTML = '<option value="" disabled selected>Selecione um produto primeiro</option>';
      elements.clientPlan.disabled = true;
      elements.clientAttendant.innerHTML = '<option value="" disabled selected>Selecione o atendente</option>';
      elements.clientAttendant.disabled = true;
      return;
    }

    // Populate plans
    elements.clientPlan.innerHTML = '<option value="" disabled selected>Selecione um plano</option>';
    if (product.plans && product.plans.length > 0) {
      product.plans.forEach(plan => {
        const opt = document.createElement('option');
        opt.value = plan.name;
        opt.setAttribute('data-price', plan.price);
        opt.textContent = `${plan.name} ($${plan.price})`;
        elements.clientPlan.appendChild(opt);
      });
      elements.clientPlan.disabled = false;
      
      // Auto-select if matches
      if (selectedPlan) {
        elements.clientPlan.value = selectedPlan;
      }
    } else {
      elements.clientPlan.innerHTML = '<option value="" disabled>Nenhum plano cadastrado</option>';
      elements.clientPlan.disabled = true;
    }

    // Populate attendants
    elements.clientAttendant.innerHTML = '<option value="" disabled selected>Selecione o atendente</option>';
    if (product.attendants && product.attendants.trim()) {
      const atts = product.attendants.split(',').map(s => s.trim()).filter(Boolean);
      atts.forEach(att => {
        const opt = document.createElement('option');
        opt.value = att;
        opt.textContent = att;
        elements.clientAttendant.appendChild(opt);
      });
      elements.clientAttendant.disabled = false;

      // Auto-select if matches
      if (selectedAttendant) {
        elements.clientAttendant.value = selectedAttendant;
      }
    } else {
      elements.clientAttendant.innerHTML = '<option value="" disabled>Nenhum atendente cadastrado</option>';
      elements.clientAttendant.disabled = true;
    }
  }

  // When selected plan changes, autofill sale price
  elements.clientPlan.addEventListener('change', (e) => {
    const selectedOpt = e.target.options[e.target.selectedIndex];
    const price = selectedOpt.getAttribute('data-price');
    if (price !== null) {
      elements.clientSaleValue.value = Number(price).toFixed(2);
    }
  });

  // Highlight all text when focusing clientSaleValue field to prevent concatenation
  elements.clientSaleValue.addEventListener('focus', (e) => {
    e.target.select();
  });

  // Format the number to 2 decimal places on blur, or clear if invalid
  elements.clientSaleValue.addEventListener('blur', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      e.target.value = val.toFixed(2);
    } else {
      e.target.value = '';
    }
  });

  // Client CRUD Actions
  elements.btnOpenAddClientModal.addEventListener('click', () => openClientModal());
  elements.btnCancelClientModal.addEventListener('click', closeClientModal);
  elements.btnCloseClientModal.addEventListener('click', closeClientModal);

  function openClientModal(id = null) {
    elements.clientForm.reset();
    
    // Set default date to today
    elements.clientDate.value = getISODateString(new Date());

    if (id) {
      state.editingClientId = Number(id);
      elements.clientModalTitle.textContent = 'Editar Cliente';
      
      const client = state.clients.find(c => Number(c.id) === Number(id));
      if (client) {
        elements.clientId.value = client.id;
        elements.clientName.value = client.name;
        elements.clientPhone.value = client.phone;
        elements.clientCountry.value = client.country;
        elements.clientZip.value = client.zip;
        elements.clientAddress.value = client.address;
        elements.clientCity.value = client.city;
        elements.clientState.value = client.state;
        elements.clientProduct.value = client.productId;
        
        // Dynamically load plans & attendants first, then set values
        updateClientModalProductDetails(client.productId, client.planName, client.attendant);

        elements.clientSaleValue.value = Number(client.saleValue).toFixed(2);
        elements.clientBottles.value = Number(client.bottles) || 1;
        elements.clientDate.value = client.date;
        elements.clientStatus.value = client.status;
        elements.clientObservations.value = client.observations || '';
        elements.clientTrackingCode.value = client.trackingCode || '';
        elements.clientDeliveryDate.value = client.deliveryDate || '';
        elements.clientSent.value = String(Boolean(client.sent));
        elements.clientDelivered.value = String(Boolean(client.delivered));
        elements.clientPaymentDate.value = client.paymentDate || '';
        elements.clientPaymentMethod.value = client.paymentMethod || '';
      }
    } else {
      state.editingClientId = null;
      elements.clientId.value = '';
      elements.clientName.value = '';
      elements.clientPhone.value = '';
      elements.clientCountry.value = '';
      elements.clientZip.value = '';
      elements.clientAddress.value = '';
      elements.clientCity.value = '';
      elements.clientState.value = '';
      elements.clientProduct.value = '';
      elements.clientSaleValue.value = '';
      elements.clientBottles.value = 1;
      elements.clientObservations.value = '';
      elements.clientTrackingCode.value = '';
      elements.clientDeliveryDate.value = '';
      elements.clientSent.value = 'false';
      elements.clientDelivered.value = 'false';
      elements.clientPaymentDate.value = '';
      elements.clientPaymentMethod.value = '';
      elements.clientModalTitle.textContent = 'Adicionar Cliente';
      elements.clientPlan.disabled = true;
      elements.clientPlan.innerHTML = '<option value="" disabled selected>Selecione um produto primeiro</option>';
      elements.clientAttendant.disabled = true;
      elements.clientAttendant.innerHTML = '<option value="" disabled selected>Selecione o atendente primeiro</option>';
    }

    elements.clientModal.classList.add('active');
  }

  function closeClientModal() {
    elements.clientModal.classList.remove('active');
  }

  elements.clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientData = {
      name: elements.clientName.value.trim(),
      phone: elements.clientPhone.value.trim(),
      country: elements.clientCountry.value,
      zip: elements.clientZip.value.trim(),
      address: elements.clientAddress.value.trim(),
      city: elements.clientCity.value.trim(),
      state: elements.clientState.value.trim(),
      productId: Number(elements.clientProduct.value),
      planName: elements.clientPlan.value,
      saleValue: Number(elements.clientSaleValue.value) || 0,
      bottles: Number(elements.clientBottles.value) || 0,
      attendant: elements.clientAttendant.value,
      date: elements.clientDate.value,
      status: elements.clientStatus.value,
      observations: elements.clientObservations.value.trim(),
      trackingCode: elements.clientTrackingCode.value.trim(),
      deliveryDate: elements.clientDeliveryDate.value,
      sent: elements.clientSent.value === 'true',
      delivered: elements.clientDelivered.value === 'true',
      paymentDate: elements.clientPaymentDate.value,
      paymentMethod: elements.clientPaymentMethod.value.trim()
    };

    if (!clientData.name || !clientData.phone || !clientData.country || !clientData.productId || !clientData.planName || !clientData.date) {
      showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
      return;
    }

    try {
      if (state.editingClientId) {
        const originalClient = state.clients.find(c => Number(c.id) === Number(state.editingClientId));
        const updatedClient = {
          ...originalClient,
          ...clientData,
          id: state.editingClientId
        };
        await window.db.put('clients', updatedClient);
        await syncAutoExpenseForClient(updatedClient, 'manual');
        showToast('Cliente editado com sucesso!');
        await logActivity('EDIT_CLIENT', `Editou cliente ${clientData.name}`, 'clients', state.editingClientId, clientData.name);
        if (originalClient && originalClient.status !== clientData.status) {
          const actionType = clientData.status === 'Pago'
            ? 'MARK_CLIENT_PAID'
            : clientData.status === 'Golpe'
              ? 'MARK_CLIENT_SCAM'
              : 'CLIENT_STATUS_CHANGE';
          await logActivity(actionType, `Alterou status do cliente ${clientData.name} para ${clientData.status}`, 'clients', state.editingClientId, clientData.name);
        }
      } else {
        if (authState.user) {
          clientData.createdById = authState.user.profileId || authState.user.id || null;
          clientData.createdByName = authState.user.name || authState.user.email || '';
        }
        clientData.creationSource = 'manual';

        const newId = await window.db.add('clients', clientData);
        clientData.id = newId;
        await syncAutoExpenseForClient(clientData, 'manual');
        showToast('Cliente cadastrado com sucesso!');
        await logActivity('ADD_CLIENT', `Cadastrou cliente ${clientData.name}`, 'clients', newId, clientData.name);
      }
      closeClientModal();
      await loadViewData('clients');
      if (typeof updateDashboard === 'function') {
        updateDashboard();
      }
    } catch (err) {
      showToast('Erro ao salvar cliente no banco.', 'error');
      console.error(err);
    }
  });

  async function deleteClient(id) {
    if (confirm('Tem certeza que deseja apagar este cliente? Essa ação não poderá ser desfeita.')) {
      try {
        const client = state.clients.find(c => Number(c.id) === Number(id));
        let autoExpenseId = null;

        if (client) {
          const autoExpense = state.expenses.find(e => 
            e.clientId === client.id || 
            (e.observation && e.observation.includes(`[AUTO_EXPENSE_CLIENT_ID:${client.id}]`))
          );
          if (autoExpense) {
            autoExpenseId = autoExpense.id;
          }
        }

        await window.db.delete('clients', id);
        await logActivity('DELETE_CLIENT', `Apagou o cliente ${client ? client.name : id}`, 'clients', id, client ? client.name : '');

        if (autoExpenseId) {
          await window.db.delete('expenses', autoExpenseId);
          state.expenses = state.expenses.filter(e => e.id !== autoExpenseId);
        }

        showToast('Cliente removido.');
        await loadViewData('clients');
        if (typeof updateDashboard === 'function') {
          updateDashboard();
        }
      } catch (err) {
        showToast('Erro ao excluir cliente.', 'error');
      }
    }
  }

  // ==========================================================================
  // SPREADSHEET IMPORT SECTION
  // ==========================================================================
  const importState = {
    currentStage: 1,
    fileName: '',
    headers: [],
    rows: [],
    mappedClients: [],
    duplicatesCount: 0,
    rowErrors: [],
    warnings: []
  };

  const KNOWN_IMPORT_PLANS = [
    { value: 217, name: '2 meses' },
    { value: 247, name: '3 meses' },
    { value: 267, name: '4 meses' },
    { value: 397, name: '6 meses' }
  ];

  const SYSTEM_MAPPING_FIELDS = [
    { key: 'name', label: 'Nome do Cliente *', required: true, auto: ['nome', 'cliente', 'nome completo', 'customer', 'name'] },
    { key: 'phone', label: 'Telefone', required: false, auto: ['telefone', 'tel', 'celular', 'phone', 'whatsapp', 'contato'] },
    { key: 'date', label: 'Data', required: true, auto: ['data', 'data do cadastro', 'data cadastro', 'data venda', 'data da venda', 'created', 'date'] },
    { key: 'attendant', label: 'Atendente responsável', required: false, auto: ['vendedor', 'atendente', 'responsavel', 'user', 'attendant', 'seller'] },
    { key: 'saleValue', label: 'Valor da venda', required: false, auto: ['valor', 'valor da venda', 'preco', 'price', 'value', 'total', 'faturamento'] },
    { key: 'productName', label: 'Produto', required: false, auto: ['produto', 'product', 'item'] },
    { key: 'planName', label: 'Plano', required: false, auto: ['plano', 'plan', 'oferta', 'offer'] },
    { key: 'bottles', label: 'Frascos', required: false, auto: ['frascos', 'frasco', 'quantidade', 'qtd', 'bottles', 'quantity'] },
    { key: 'sent', label: 'Enviado', required: false, auto: ['enviado', 'envio', 'sent', 'shipped'] },
    { key: 'paidStatus', label: 'Status de pagamento (Pago)', required: false, auto: ['pago', 'status de pagamento', 'status pagto', 'paid', 'payment'] },
    { key: 'paymentDate', label: 'Data do pagamento', required: false, auto: ['data do pg', 'data pg', 'data do pagamento', 'data pagto', 'data pagamento', 'payment date', 'paid date'] },
    { key: 'paymentMethod', label: 'Forma de pagamento', required: false, auto: ['forma de pagamento', 'metodo de pagamento', 'método de pagamento', 'payment method', 'forma pg', 'forma pgto'] },
    { key: 'deliveryDate', label: 'Data de entrega / Golpe', required: false, auto: ['data de entrega', 'data entrega', 'delivery date', 'delivery'] },
    { key: 'delivered', label: 'Entregue', required: false, auto: ['entregue', 'recebido', 'delivered', 'received'] },
    { key: 'trackingCode', label: 'Código de rastreio', required: false, auto: ['codigo de rastreio', 'rastreio', 'tracking', 'tracking code', 'rastrear'] },
    { key: 'observations', label: 'Observações', required: false, auto: ['observacoes', 'obs', 'notes', 'observation'] },
    { key: 'country', label: 'País', required: false, auto: ['pais', 'country'] },
    { key: 'zip', label: 'Código Postal', required: false, auto: ['cep', 'zip', 'zipcode', 'codigo postal'] },
    { key: 'address', label: 'Endereço', required: false, auto: ['endereco', 'rua', 'logradouro', 'address'] },
    { key: 'city', label: 'Cidade', required: false, auto: ['cidade', 'city'] },
    { key: 'state', label: 'Estado / UF', required: false, auto: ['estado', 'uf', 'state'] }
  ];

  // Helper helper: Clean and format values
  function cleanPhone(phone) {
    return String(phone || '').replace(/\D/g, '');
  }

  function cleanName(name) {
    return String(name || '').toLowerCase().trim();
  }

  function findExistingDuplicate(clientData) {
    const cleanP = cleanPhone(clientData.phone);
    const cleanN = cleanName(clientData.name);
    
    return state.clients.find(c => {
      const existingCleanP = cleanPhone(c.phone);
      const existingCleanN = cleanName(c.name);
      
      const phoneMatch = cleanP && existingCleanP && cleanP === existingCleanP;
      const nameMatch = cleanN === existingCleanN;
      
      return phoneMatch || nameMatch;
    });
  }

  function getDefaultAttendantForProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (product && product.attendants) {
      const list = product.attendants.split(',').map(a => a.trim());
      return list[0] || '';
    }
    return '';
  }

  function detectMonthYearFromFilename(fileName) {
    if (!fileName) return null;
    const lower = fileName.toLowerCase();
    
    // Check patterns like XX_MM or XX-MM
    // E.g. 01_05 or 31_01 or 01-12
    const matches = lower.match(/(\d{2})[_|-](\d{2})/);
    if (matches) {
      const monthNum = parseInt(matches[2], 10);
      if (monthNum >= 1 && monthNum <= 12) {
        let year = new Date().getFullYear();
        const yearMatch = lower.match(/(202\d|201\d)/);
        if (yearMatch) {
          year = parseInt(yearMatch[1], 10);
        }
        return { month: monthNum - 1, year };
      }
    }
    
    const months = [
      { index: 0, names: ['janeiro', 'jan', '_01', '-01', '01_01'] },
      { index: 1, names: ['fevereiro', 'fev', '_02', '-02'] },
      { index: 2, names: ['marco', 'março', 'mar', '_03', '-03'] },
      { index: 3, names: ['abril', 'abr', '_04', '-04'] },
      { index: 4, names: ['maio', 'mai', '_05', '-05'] },
      { index: 5, names: ['junho', 'jun', '_06', '-06'] },
      { index: 6, names: ['julho', 'jul', '_07', '-07'] },
      { index: 7, names: ['agosto', 'ago', '_08', '-08'] },
      { index: 8, names: ['setembro', 'set', '_09', '-09'] },
      { index: 9, names: ['outubro', 'out', '_10', '-10'] },
      { index: 10, names: ['novembro', 'nov', '_11', '-11'] },
      { index: 11, names: ['dezembro', 'dez', '_12', '-12'] }
    ];

    for (const m of months) {
      for (const name of m.names) {
        if (lower.includes(name)) {
          let year = new Date().getFullYear();
          const yearMatch = lower.match(/(202\d|201\d)/);
          if (yearMatch) {
            year = parseInt(yearMatch[1], 10);
          }
          return { month: m.index, year };
        }
      }
    }
    return null;
  }

  function parseSpreadsheetDate(val, refMonth, refYear) {
    if (val === undefined || val === null) return '';
    const valStr = String(val).trim();
    if (!valStr) return '';

    // Check if it's an Excel serial date number
    if (!isNaN(valStr) && parseFloat(valStr) > 30000 && parseFloat(valStr) < 60000) {
      const date = new Date((parseFloat(valStr) - 25569) * 86400 * 1000);
      let y = date.getFullYear();
      let m = String(date.getMonth() + 1).padStart(2, '0');
      let d = String(date.getDate()).padStart(2, '0');
      
      if (y < 2010 || y > 2035) {
        y = refYear;
      }
      return `${y}-${m}-${d}`;
    }

    // Try parsing as ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(valStr)) {
      let y = valStr.substring(0, 4);
      let m = valStr.substring(5, 7);
      let d = valStr.substring(8, 10);
      const yearNum = parseInt(y, 10);
      if (yearNum < 2010 || yearNum > 2035) {
        y = refYear;
      }
      return `${y}-${m}-${d}`;
    }

    const parts = valStr.match(/(\d{1,4})/g);
    if (parts) {
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          let y = parts[0];
          let m = parts[1].padStart(2, '0');
          let d = parts[2].padStart(2, '0');
          const yearNum = parseInt(y, 10);
          if (yearNum < 2010 || yearNum > 2035) {
            y = refYear;
          }
          return `${y}-${m}-${d}`;
        } else {
          // DD/MM/YYYY
          let d = parts[0].padStart(2, '0');
          let m = parts[1].padStart(2, '0');
          let y = parts[2];
          if (y.length === 2) {
            y = '20' + y;
          }
          const yearNum = parseInt(y, 10);
          if (isNaN(yearNum) || yearNum < 2010 || yearNum > 2035) {
            y = refYear;
          }
          return `${y}-${m}-${d}`;
        }
      } else if (parts.length === 2) {
        // DD/MM
        let d = parts[0].padStart(2, '0');
        let m = parts[1].padStart(2, '0');
        let y = refYear;
        return `${y}-${m}-${d}`;
      } else if (parts.length === 1) {
        // Day only
        let d = parts[0].padStart(2, '0');
        let m = String(refMonth + 1).padStart(2, '0');
        let y = refYear;
        return `${y}-${m}-${d}`;
      }
    }

    return '';
  }

  function parseBooleanFlag(val) {
    const normalized = String(val || '').toLowerCase().trim();
    return ['true', '1', 'sim', 'yes', 'check', 'ok', 's', 'y', 'v', 'enviado', 'entregue'].includes(normalized);
  }

  function normalizeImportText(val) {
    return String(val || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function parsePaymentFlag(val) {
    const normalized = normalizeImportText(val);
    if (!normalized || ['false', '0', 'nao', 'nao pago', 'não pago', 'no', 'n', 'pendente'].includes(normalized)) {
      return false;
    }
    return ['true', '1', 'sim', 's', 'yes', 'y', 'pago', 'paid', 'ok', 'check', 'v'].includes(normalized);
  }

  function isValidISODate(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateString || ''))) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function dateNeedsReferenceMonthYear(val) {
    const parts = String(val || '').trim().match(/(\d{1,4})/g);
    if (!parts) return false;
    return parts.length < 3;
  }

  function parseCurrencyString(val) {
    if (val === undefined || val === null) return null;
    let cleanStr = String(val).trim();
    if (!cleanStr) return 0;

    cleanStr = cleanStr
      .replace(/[^\d,.-]/g, '')
      .replace(/(?!^)-/g, '');

    if (!cleanStr || cleanStr === '-' || cleanStr === ',' || cleanStr === '.') {
      return null;
    }

    const hadDecimalSeparator = /[,.]/.test(cleanStr);

    const separatorMatches = [...cleanStr.matchAll(/[,.]/g)];
    if (separatorMatches.length > 0) {
      const lastSeparatorIndex = separatorMatches[separatorMatches.length - 1].index;
      const decimalPart = cleanStr.slice(lastSeparatorIndex + 1);
      const integerPart = cleanStr.slice(0, lastSeparatorIndex).replace(/[,.]/g, '');

      if (decimalPart.length > 0 && decimalPart.length <= 2) {
        cleanStr = `${integerPart || '0'}.${decimalPart}`;
      } else {
        cleanStr = cleanStr.replace(/[,.]/g, '');
      }
    }

    let parsed = parseFloat(cleanStr);
    if (isNaN(parsed) || parsed < 0) return null;
    if (!hadDecimalSeparator && parsed >= 5000 && parsed % 100 === 0) {
      parsed = parsed / 100;
    }
    return Number(parsed.toFixed(2));
  }

  function identifyImportPlanByValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return '';
    const match = KNOWN_IMPORT_PLANS.find(plan => Math.abs(numericValue - plan.value) < 0.01);
    return match ? match.name : '';
  }

  function formatImportWarningValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return String(value || '').trim();
    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: numericValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  }

  function addImportWarning(message, context = {}) {
    if (!importState.warnings.includes(message)) {
      importState.warnings.push(message);
    }
    console.warn('[Help Vitall][Import]', message, context);
  }

  function parseOptionalImportDate(rawValue, refMonth, refYear) {
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') {
      return { date: '', invalid: false };
    }

    const rawText = String(rawValue).trim();
    const numericRaw = Number(rawText.replace(',', '.'));
    const isExcelSerialDate = Number.isFinite(numericRaw) && numericRaw > 30000 && numericRaw < 60000;
    const parts = rawText.match(/(\d{1,4})/g);
    if (!isExcelSerialDate && (!parts || parts.length < 2)) {
      return { date: '', invalid: true };
    }

    const parsed = parseSpreadsheetDate(rawValue, refMonth, refYear);
    if (!parsed || !isValidISODate(parsed)) {
      return { date: '', invalid: true };
    }

    return { date: parsed, invalid: false };
  }

  function renderImportWarnings() {
    if (!elements.importWarningsBox || !elements.importWarningsList) return;

    elements.importWarningsList.innerHTML = '';
    if (importState.warnings.length === 0) {
      elements.importWarningsBox.style.display = 'none';
      return;
    }

    const visibleWarnings = importState.warnings.slice(0, 25);
    visibleWarnings.forEach(warning => {
      const li = document.createElement('li');
      li.textContent = warning;
      elements.importWarningsList.appendChild(li);
    });

    if (importState.warnings.length > visibleWarnings.length) {
      const li = document.createElement('li');
      li.textContent = `Mais ${importState.warnings.length - visibleWarnings.length} aviso(s) oculto(s).`;
      elements.importWarningsList.appendChild(li);
    }

    elements.importWarningsBox.style.display = 'block';
  }

  function getImportErrorMessage(err) {
    const rawMessage = String(err?.message || err || '');
    const rawCode = String(err?.code || '');
    const lower = rawMessage.toLowerCase();

    if (rawCode === '42703' || lower.includes('column') || lower.includes('coluna')) {
      return `Erro ao salvar cliente: coluna não encontrada no Supabase (${rawMessage})`;
    }
    if (rawCode === '42501' || lower.includes('row-level security') || lower.includes('permission denied') || lower.includes('permiss')) {
      return 'Erro ao importar: permissão negada no Supabase.';
    }
    if (rawCode === '23502' || lower.includes('null value')) {
      return `Erro ao importar: campo obrigatório vazio (${rawMessage})`;
    }
    if (rawCode === '22P02' || lower.includes('invalid input')) {
      return `Erro ao importar: tipo de dado inválido (${rawMessage})`;
    }
    if (lower.includes('valor')) {
      return rawMessage;
    }
    if (lower.includes('data')) {
      return rawMessage;
    }
    return `Erro ao importar planilha: ${rawMessage || 'erro inesperado ao salvar cliente'}`;
  }

  async function correctExistingClientValues() {
    const clients = await window.db.getAll('clients');
    const products = await window.db.getAll('products');
    
    // Gather all unique plan prices in the system
    const allPlanPrices = new Set();
    products.forEach(p => {
      if (p.plans) {
        p.plans.forEach(pl => {
          const priceNum = parseFloat(pl.price);
          if (!isNaN(priceNum) && priceNum > 0) {
            allPlanPrices.add(priceNum);
          }
        });
      }
    });

    let correctedCount = 0;

    for (const client of clients) {
      const val = parseFloat(client.saleValue);
      if (isNaN(val) || val <= 0) continue;

      let corrected = false;
      let newVal = val;

      // Rule 1: check if it matches 100x any plan price in the system (concatenation symptom)
      for (const planPrice of allPlanPrices) {
        if (Math.abs(val - (planPrice * 100)) < 0.01) {
          newVal = planPrice;
          corrected = true;
          break;
        }
      }

      // Rule 2: if it is abnormally high (e.g. >= 5000) and ends with 00 (e.g. 21700)
      if (!corrected && val >= 5000) {
        const possibleVal = val / 100;
        if (possibleVal < 2000) {
          newVal = possibleVal;
          corrected = true;
        }
      }

      if (corrected) {
        client.saleValue = newVal;
        await window.db.put('clients', client);
        correctedCount++;
      }
    }

    if (correctedCount > 0) {
      console.log(`[Help Vitall] Corrected ${correctedCount} client records with concatenated values.`);
    }
  }

  // Open and close Modal routines
  function openImportModal() {
    importState.currentStage = 1;
    importState.fileName = '';
    importState.headers = [];
    importState.rows = [];
    importState.mappedClients = [];
    importState.duplicatesCount = 0;
    importState.rowErrors = [];
    importState.warnings = [];
    renderImportWarnings();
    
    elements.importFile.value = '';
    elements.importGSheetsUrl.value = '';
    elements.selectedFileInfo.style.display = 'none';
    elements.selectedFileInfo.textContent = '';
    elements.importDuplicateAction.value = 'ignore';
    
    populateImportProductsDropdown();
    showImportStage(1);
    elements.importModal.classList.add('active');
  }

  function closeImportModal() {
    elements.importModal.classList.remove('active');
  }

  function populateImportProductsDropdown() {
    const productsSelect = elements.importDefaultProduct;
    productsSelect.innerHTML = '<option value="" selected>Sem produto padrão</option>';
    
    state.products.forEach(p => {
      if (p.status === 'active') {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        productsSelect.appendChild(opt);
      }
    });

    elements.importDefaultPlan.innerHTML = '<option value="" selected>Sem plano padrão</option>';
    elements.importDefaultPlan.disabled = true;
  }

  // Monitor product selection in import default settings
  elements.importDefaultProduct.addEventListener('change', () => {
    const productId = Number(elements.importDefaultProduct.value);
    const product = state.products.find(p => p.id === productId);
    const planSelect = elements.importDefaultPlan;
    
    planSelect.innerHTML = '<option value="" selected>Sem plano padrão</option>';
    
    if (product && product.plans && product.plans.length > 0) {
      product.plans.forEach(plan => {
        const opt = document.createElement('option');
        opt.value = plan.name;
        opt.textContent = `${plan.name} (${formatCurrency(plan.price)})`;
        planSelect.appendChild(opt);
      });
      planSelect.disabled = false;
    } else {
      planSelect.disabled = true;
    }
  });

  // Event Listeners for Opening/Closing
  elements.btnOpenImportModal.addEventListener('click', () => {
    openImportModal();
  });

  elements.btnCloseImportModal.addEventListener('click', closeImportModal);
  elements.btnCancelImport.addEventListener('click', closeImportModal);

  // File Drag & Drop Handlers
  elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.style.borderColor = 'var(--color-green-500)';
    elements.dropZone.style.background = 'var(--primary-light)';
  });

  elements.dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.style.borderColor = 'var(--border-color)';
    elements.dropZone.style.background = 'var(--bg-primary)';
  });

  elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.style.borderColor = 'var(--border-color)';
    elements.dropZone.style.background = 'var(--bg-primary)';
    
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      elements.importFile.files = files;
      handleFileSelected(files[0]);
    }
  });

  elements.importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    importState.fileName = file.name;
    const sizeStr = file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`;
    elements.selectedFileInfo.textContent = `Arquivo selecionado: ${file.name} (${sizeStr})`;
    elements.selectedFileInfo.style.display = 'block';
    
    elements.importGSheetsUrl.value = '';
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        parseWorkbook(workbook);
      } catch (err) {
        showToast('Erro ao ler arquivo. Certifique-se de que é um Excel ou CSV válido.', 'error');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Load Google Sheets URL
  elements.btnLoadGSheets.addEventListener('click', async () => {
    const urlVal = elements.importGSheetsUrl.value.trim();
    if (!urlVal) {
      showToast('Por favor, insira o link do Google Sheets.', 'error');
      return;
    }

    const match = urlVal.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      showToast('Link do Google Sheets inválido. O link deve conter "/spreadsheets/d/ID".', 'error');
      return;
    }

    const spreadsheetId = match[1];
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

    showToast('Carregando planilha do Google Sheets...');
    elements.btnLoadGSheets.disabled = true;
    elements.btnLoadGSheets.textContent = 'Carregando...';

    try {
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error('Falha ao baixar planilha do Google Sheets.');
      }
      const csvText = await response.text();
      
      elements.importFile.value = '';
      elements.selectedFileInfo.textContent = `Google Sheets importado com sucesso!`;
      elements.selectedFileInfo.style.display = 'block';
      importState.fileName = 'Google Sheets Link';

      const workbook = XLSX.read(csvText, { type: 'string' });
      parseWorkbook(workbook);
      showToast('Planilha do Google Sheets carregada com sucesso!');
    } catch (err) {
      showToast('Erro ao acessar Google Sheets. O arquivo deve estar compartilhado publicamente ("Qualquer pessoa com o link").', 'error');
      console.error(err);
    } finally {
      elements.btnLoadGSheets.disabled = false;
      elements.btnLoadGSheets.textContent = 'Carregando';
    }
  });

  function parseWorkbook(workbook) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (rawRows.length === 0) {
      showToast('A planilha está vazia.', 'error');
      return;
    }
    
    let headerIdx = 0;
    while (headerIdx < rawRows.length && rawRows[headerIdx].every(cell => cell === '')) {
      headerIdx++;
    }
    
    if (headerIdx >= rawRows.length) {
      showToast('Nenhum cabeçalho encontrado na planilha.', 'error');
      return;
    }
    
    importState.headers = rawRows[headerIdx].map(h => String(h).trim()).filter(h => h !== '');
    
    importState.rows = [];
    for (let i = headerIdx + 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')) {
        const rowObj = {};
        rawRows[headerIdx].forEach((header, idx) => {
          if (header) {
            rowObj[String(header).trim()] = row[idx] !== undefined ? String(row[idx]).trim() : '';
          }
        });
        importState.rows.push(rowObj);
      }
    }
    
    const MONTH_NAMES = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const detected = detectMonthYearFromFilename(importState.fileName);
    if (detected) {
      elements.importRefMonth.value = detected.month;
      elements.importRefYear.value = detected.year;
      elements.importDetectedMonthYear.textContent = `${MONTH_NAMES[detected.month]} de ${detected.year}`;
    } else {
      const now = new Date();
      elements.importRefMonth.value = now.getMonth();
      elements.importRefYear.value = now.getFullYear();
      elements.importDetectedMonthYear.textContent = 'Não identificado (Usando atual)';
    }

    showToast(`${importState.rows.length} linhas de dados encontradas.`);
  }

  function renderMappingFields() {
    const container = elements.mappingFieldsContainer;
    container.innerHTML = '';
    
    SYSTEM_MAPPING_FIELDS.forEach(field => {
      const card = document.createElement('div');
      card.className = 'mapping-field-card';
      
      const label = document.createElement('label');
      label.textContent = field.label;
      card.appendChild(label);
      
      const select = document.createElement('select');
      select.className = 'form-select';
      select.id = `map_${field.key}`;
      
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Não mapeado / Valor Padrão';
      select.appendChild(defaultOpt);
      
      let bestMatch = '';
      let bestScore = 0;
      importState.headers.forEach(header => {
        const opt = document.createElement('option');
        opt.value = header;
        opt.textContent = header;
        select.appendChild(opt);
        
        const normHeader = normalizeImportText(header);
        field.auto.forEach(keyword => {
          const normKeyword = normalizeImportText(keyword);
          let score = 0;
          if (normHeader === normKeyword) {
            score = 100;
          } else if (normHeader.startsWith(normKeyword)) {
            score = 70;
          } else if (normHeader.includes(normKeyword)) {
            score = normKeyword.length <= 4 ? 25 : 50;
          }

          if (score > bestScore) {
            bestMatch = header;
            bestScore = score;
          }
        });
      });
      
      if (bestMatch) {
        select.value = bestMatch;
      }
      
      card.appendChild(select);
      container.appendChild(card);
    });
  }

  function validateStage1() {
    if (importState.rows.length === 0) {
      showToast('Por favor, selecione uma planilha ou carregue um link do Google Sheets válido.', 'error');
      return false;
    }
    return true;
  }

  function validateStage2() {
    const nameMap = document.getElementById('map_name').value;
    if (!nameMap) {
      showToast('Mapeamento da coluna "Nome do Cliente" é obrigatório.', 'error');
      return false;
    }
    const dateMap = document.getElementById('map_date').value;
    if (!dateMap) {
      showToast('Erro ao importar: mapeie a coluna DATA para manter o mês correto da planilha.', 'error');
      return false;
    }
    return true;
  }

  function generateImportPreview() {
    const mappings = {};
    SYSTEM_MAPPING_FIELDS.forEach(field => {
      mappings[field.key] = document.getElementById(`map_${field.key}`).value;
    });

    const defaultProductId = elements.importDefaultProduct.value ? Number(elements.importDefaultProduct.value) : null;
    const defaultPlanName = elements.importDefaultPlan.value || '';
    const defaultProduct = state.products.find(p => p.id === defaultProductId);

    const refMonth = parseInt(elements.importRefMonth.value, 10);
    const refYear = parseInt(elements.importRefYear.value, 10);

    importState.mappedClients = [];
    importState.rowErrors = [];
    importState.warnings = [];

    // Scan if there is at least one valid date in the spreadsheet
    let hasAnyValidDate = false;
    if (mappings.date) {
      for (const row of importState.rows) {
        if (row[mappings.date]) {
          const parsed = parseSpreadsheetDate(row[mappings.date], refMonth, refYear);
          if (parsed) {
            hasAnyValidDate = true;
            break;
          }
        }
      }
    }
    
    let minDate = null;
    let maxDate = null;
    let countPaid = 0;
    let countPending = 0;
    let countLoss = 0;
    let totalRevenue = 0;
    let totalLossVal = 0;
    let needsReferenceMonthYear = false;

    let plan2Count = 0;
    let plan3Count = 0;
    let plan4Count = 0;
    let plan6Count = 0;
    let planUnknownCount = 0;

    importState.rows.forEach((row, rowIndex) => {
      const name = mappings.name ? row[mappings.name] : '';
      if (!name || String(name).trim() === '') return;

      const phone = mappings.phone ? row[mappings.phone] : '';
      
      const rawDate = mappings.date ? row[mappings.date] : '';
      if (dateNeedsReferenceMonthYear(rawDate)) {
        needsReferenceMonthYear = true;
      }

      const date = parseSpreadsheetDate(rawDate, refMonth, refYear);
      if (!date || !isValidISODate(date)) {
        const message = `Erro ao importar: data inválida na linha ${rowIndex + 2}.`;
        importState.rowErrors.push(message);
        console.error('[Help Vitall][Import]', message, { row });
        return;
      }
      
      const attendant = mappings.attendant ? row[mappings.attendant] : '';
      const saleValue = mappings.saleValue ? row[mappings.saleValue] : '';
      const mappedProductName = mappings.productName ? row[mappings.productName] : '';
      const mappedPlanName = mappings.planName ? row[mappings.planName] : '';
      const bottles = mappings.bottles ? row[mappings.bottles] : '';
      const sent = mappings.sent ? row[mappings.sent] : '';
      const paidStatus = mappings.paidStatus ? row[mappings.paidStatus] : '';
      
      const rawPaymentDate = mappings.paymentDate ? row[mappings.paymentDate] : '';
      const rawDeliveryDate = mappings.deliveryDate ? row[mappings.deliveryDate] : '';
      let paymentDate = parseSpreadsheetDate(rawPaymentDate, refMonth, refYear);
      const deliveryDateResult = parseOptionalImportDate(rawDeliveryDate, refMonth, refYear);
      const deliveryDate = deliveryDateResult.date;
      if (rawPaymentDate && (!paymentDate || !isValidISODate(paymentDate))) {
        paymentDate = '';
        addImportWarning(`Linha ${rowIndex + 2}: data do pagamento inválida, será ignorada`, {
          value: rawPaymentDate,
          row
        });
      }
      if (deliveryDateResult.invalid) {
        addImportWarning(`Linha ${rowIndex + 2}: data de entrega inválida, será ignorada`, {
          value: rawDeliveryDate,
          row
        });
      }
      const paymentMethod = mappings.paymentMethod ? row[mappings.paymentMethod] : '';
      
      const delivered = mappings.delivered ? row[mappings.delivered] : '';
      const trackingCode = mappings.trackingCode ? row[mappings.trackingCode] : '';
      const observations = mappings.observations ? row[mappings.observations] : '';
      const country = mappings.country ? row[mappings.country] : '';
      const zip = mappings.zip ? row[mappings.zip] : '';
      const address = mappings.address ? row[mappings.address] : '';
      const city = mappings.city ? row[mappings.city] : '';
      const stateVal = mappings.state ? row[mappings.state] : '';

      // Import rules
      let status = 'Pagamento pendente';
      const paidStr = String(paidStatus).toLowerCase().trim();
      const deliveryStr = String(rawDeliveryDate).toLowerCase().trim();
      const deliveredStr = String(delivered).toLowerCase().trim();
      const obsStr = String(observations).toLowerCase().trim();
      const wholeRowText = normalizeImportText(Object.values(row).join(' '));
      const combinedStatusText = normalizeImportText(`${paidStr} ${deliveryStr} ${deliveredStr} ${obsStr} ${wholeRowText}`);

      const isPaid = parsePaymentFlag(paidStatus);
      const isScam = ['golpe', 'scam', 'fraude', 'devolvido', 'devolucao', 'cliente fez devolucao', 'prejuizo'].some(term => combinedStatusText.includes(term));

      if (isScam) {
        status = 'Golpe';
      } else if (isPaid) {
        status = 'Pago';
      } else {
        status = 'Pagamento pendente';
      }

      const parsedValue = parseCurrencyString(saleValue);
      if (parsedValue === null) {
        const message = `Erro ao importar planilha: campo valor inválido na linha ${rowIndex + 2}.`;
        importState.rowErrors.push(message);
        console.error('[Help Vitall][Import]', message, { value: saleValue, row });
        return;
      }

      let parsedBottles = parseInt(String(bottles).replace(/\D/g, ''), 10);
      if (isNaN(parsedBottles)) {
        parsedBottles = 0;
      }

      if (date) {
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }

      let finalCountry = String(country).trim();
      if (!finalCountry) {
        finalCountry = 'Estados Unidos';
      }

      let finalProductId = defaultProductId;
      let finalProductName = defaultProduct?.name || '';
      const productNameFromSheet = String(mappedProductName || '').trim();
      if (productNameFromSheet) {
        const foundProduct = state.products.find(p => normalizeImportText(p.name) === normalizeImportText(productNameFromSheet));
        if (foundProduct) {
          finalProductId = foundProduct.id;
          finalProductName = foundProduct.name;
        } else {
          finalProductId = null;
          finalProductName = productNameFromSheet;
        }
      }

      let finalPlanName = '';
      const knownPlanName = identifyImportPlanByValue(parsedValue);
      const hasSaleValue = Number(parsedValue) > 0;

      if (knownPlanName) {
        finalPlanName = knownPlanName;
        if (knownPlanName === '2 meses') plan2Count++;
        if (knownPlanName === '3 meses') plan3Count++;
        if (knownPlanName === '4 meses') plan4Count++;
        if (knownPlanName === '6 meses') plan6Count++;
      } else if (hasSaleValue) {
        finalPlanName = 'Não identificado';
        status = 'Pagamento pendente';
        addImportWarning(`Linha ${rowIndex + 2}: plano não identificado pelo valor ${formatImportWarningValue(parsedValue)}`, {
          value: parsedValue,
          row
        });
      } else {
        finalPlanName = String(mappedPlanName || defaultPlanName || '').trim() || 'Não identificado';
      }

      if (finalPlanName === 'Não identificado') {
        planUnknownCount++;
      }

      const finalPaymentDate = status === 'Pago' ? (paymentDate || date) : (paymentDate || '');
      const financialDate = status === 'Pago' ? finalPaymentDate : date;

      if (status === 'Pago') {
        countPaid++;
        totalRevenue += parsedValue;
      } else if (status === 'Golpe') {
        countLoss++;
        totalLossVal += parsedValue;
      } else {
        countPending++;
      }

      const clientData = {
        name: String(name).trim(),
        phone: String(phone).trim(),
        country: finalCountry,
        zip: String(zip).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        state: String(stateVal).trim(),
        productId: finalProductId,
        productName: finalProductName,
        planName: finalPlanName,
        saleValue: parsedValue,
        attendant: String(attendant).trim() || getDefaultAttendantForProduct(finalProductId),
        date: date,
        status: status,
        paid: status === 'Pago',
        bottles: parsedBottles,
        sent: parseBooleanFlag(sent),
        trackingCode: String(trackingCode).trim(),
        paymentDate: finalPaymentDate,
        financialDate: financialDate,
        paymentMethod: String(paymentMethod).trim(),
        deliveryDate: deliveryDate,
        delivered: parseBooleanFlag(delivered),
        observations: String(observations).trim()
      };

      // Check if automatic cost can be identified
      const costRule = findCostRule(finalProductName, parsedBottles);
      if (!costRule && finalProductName) {
        const warningMsg = `Linha ${rowIndex + 2}: custo automático não identificado para ${finalProductName} com ${parsedBottles} potes.`;
        if (!importState.warnings.includes(warningMsg)) {
          importState.warnings.push(warningMsg);
        }
      }

      importState.mappedClients.push(clientData);
    });

    // Detect duplicates
    let dupCount = 0;
    importState.mappedClients.forEach(client => {
      const dup = findExistingDuplicate(client);
      if (dup) {
        dupCount++;
        client._isDuplicate = true;
        client._duplicateId = dup.id;
      } else {
        client._isDuplicate = false;
      }
    });
    importState.duplicatesCount = dupCount;

    if (needsReferenceMonthYear) {
      showToast('A planilha contém datas sem ano. Confira o mês/ano de referência antes de confirmar.', 'error');
      console.warn('[Help Vitall][Import] Datas sem ano detectadas; usando mês/ano selecionado na tela.', {
        month: refMonth + 1,
        year: refYear
      });
    }

    if (importState.rowErrors.length > 0) {
      showToast(importState.rowErrors[0], 'error');
    }

    renderImportWarnings();

    // Render Preview UI
    const badge = elements.previewDuplicatesCount;
    if (dupCount > 0) {
      badge.textContent = `${dupCount} registros duplicados encontrados`;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }

    // Update summary stats in DOM
    elements.importSummaryPaid.textContent = countPaid;
    elements.importSummaryPending.textContent = countPending;
    elements.importSummaryLoss.textContent = countLoss;
    elements.importSummaryRevenue.textContent = formatCurrency(totalRevenue);
    elements.importSummaryLossVal.textContent = formatCurrency(totalLossVal);
    
    // Update plan counts in DOM
    elements.importSummaryPlan2.textContent = plan2Count;
    elements.importSummaryPlan3.textContent = plan3Count;
    elements.importSummaryPlan4.textContent = plan4Count;
    elements.importSummaryPlan6.textContent = plan6Count;
    elements.importSummaryPlanUnknown.textContent = planUnknownCount;

    if (minDate && maxDate) {
      elements.importSummaryDatesRange.textContent = `${formatDateDisplay(minDate)} a ${formatDateDisplay(maxDate)}`;
    } else {
      elements.importSummaryDatesRange.textContent = 'Nenhuma data';
    }

    const previewBody = elements.importPreviewTableBody;
    previewBody.innerHTML = '';

    if (importState.mappedClients.length === 0) {
      previewBody.innerHTML = '<tr><td colspan="7" class="table-empty">Nenhum registro de cliente válido encontrado para importar.</td></tr>';
      return;
    }

    importState.mappedClients.forEach(client => {
      const tr = document.createElement('tr');
      
      let dupBadge = '';
      if (client._isDuplicate) {
        const action = elements.importDuplicateAction.value;
        if (action === 'ignore') {
          dupBadge = '<span class="badge badge-danger" style="margin-left:8px; font-size:0.65rem;">Duplicado (Ignorar)</span>';
        } else if (action === 'update') {
          dupBadge = '<span class="badge badge-warning" style="margin-left:8px; font-size:0.65rem;">Duplicado (Atualizar)</span>';
        } else {
          dupBadge = '<span class="badge badge-neutral" style="margin-left:8px; font-size:0.65rem;">Duplicado (Importar)</span>';
        }
      }

      let statusBadge = 'badge-neutral';
      if (client.status === 'Pago') statusBadge = 'badge-success';
      else if (client.status === 'Golpe') statusBadge = 'badge-danger';
      else if (client.status === 'Pagamento pendente') statusBadge = 'badge-warning';

      let planDisplay = escapeHTML(client.planName);
      if (client.planName === 'Não identificado') {
        planDisplay = `<span class="badge badge-warning" style="font-size:0.75rem; font-weight:600; background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">⚠️ Não identificado</span>`;
      }

      const prod = state.products.find(p => p.id === client.productId);
      const prodName = prod ? prod.name : (client.productName || 'Sem produto');
      const productAndPotes = `${prodName} (${client.bottles || 0} potes)`;

      const costRule = findCostRule(prodName, client.bottles);
      let costDisplay = '';
      let profitDisplay = '';
      
      if (costRule) {
        costDisplay = formatCurrency(costRule.estimatedTotalCost);
        profitDisplay = formatCurrency(client.saleValue - costRule.estimatedTotalCost);
      } else {
        costDisplay = '<span class="badge badge-warning" style="font-size:0.75rem; background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 2px 6px; border-radius: 4px;">Não id.</span>';
        profitDisplay = formatCurrency(client.saleValue);
      }

      tr.innerHTML = `
        <td>
          <div style="font-weight:600;">${escapeHTML(client.name)}</div>
          ${dupBadge}
        </td>
        <td>${formatCurrency(client.saleValue)}</td>
        <td>${escapeHTML(productAndPotes)}</td>
        <td>${planDisplay}</td>
        <td>${escapeHTML(client.attendant)}</td>
        <td>${costDisplay}</td>
        <td>${profitDisplay}</td>
      `;
      previewBody.appendChild(tr);
    });
  }

  async function executeImport() {
    if (importState.rowErrors.length > 0) {
      const firstError = importState.rowErrors[0];
      console.error('[Help Vitall][Import] Import blocked because preview has validation errors.', importState.rowErrors);
      showToast(firstError, 'error');
      return;
    }

    if (importState.mappedClients.length === 0) {
      showToast('Erro ao importar planilha: nenhum cliente válido encontrado na prévia.', 'error');
      return;
    }

    let importedCount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let scamCount = 0;
    let errorCount = 0;
    let totalRevenue = 0;
    let totalLoss = 0;
    let firstErrorMessage = '';
    
    const action = elements.importDuplicateAction.value;
    
    showToast('Processando importação dos clientes...');
    elements.btnImportNext.disabled = true;
    elements.btnImportNext.textContent = 'Processando...';

    for (const [index, client] of importState.mappedClients.entries()) {
      try {
        if (!client.name) {
          errorCount++;
          continue;
        }

        if (authState.user) {
          client.createdById = authState.user.profileId || authState.user.id || null;
          client.createdByName = authState.user.name || authState.user.email || '';
        }
        client.creationSource = 'spreadsheet';

        if (client._isDuplicate) {
          if (action === 'ignore') {
            continue; // Skip
          } else if (action === 'update') {
            const existing = await window.db.get('clients', client._duplicateId);
            if (existing) {
              client.id = existing.id;
              for (const k in existing) {
                if (client[k] === undefined || client[k] === '') {
                  client[k] = existing[k];
                }
              }
              await window.db.put('clients', client);
            } else {
              const newId = await window.db.add('clients', client);
              client.id = newId;
            }
          } else {
            delete client.id;
            delete client._duplicateId;
            delete client._isDuplicate;
            const newId = await window.db.add('clients', client);
            client.id = newId;
          }
        } else {
          delete client.id;
          delete client._duplicateId;
          delete client._isDuplicate;
          const newId = await window.db.add('clients', client);
          client.id = newId;
        }

        // Sync automatic expense for this client
        await syncAutoExpenseForClient(client, 'import');

        importedCount++;
        if (client.status === 'Pago') {
          paidCount++;
          totalRevenue += client.saleValue;
        } else if (client.status === 'Golpe') {
          scamCount++;
          totalLoss += client.saleValue;
        } else {
          pendingCount++;
        }
      } catch (err) {
        const friendlyMessage = getImportErrorMessage(err);
        if (!firstErrorMessage) {
          firstErrorMessage = friendlyMessage;
        }
        console.error(`[Help Vitall][Import] Error importing row ${index + 1}: ${friendlyMessage}`, {
          error: err,
          client
        });
        errorCount++;
      }
    }

    try {
      const lowerFileName = String(importState.fileName || '').toLowerCase();
      let sourceType = 'unknown';
      if (lowerFileName.includes('google sheets')) {
        sourceType = 'google_sheets';
      } else if (lowerFileName.endsWith('.csv')) {
        sourceType = 'csv';
      } else if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
        sourceType = 'excel';
      }

      await window.db.add('spreadsheet_imports', {
        fileName: importState.fileName,
        sourceType,
        totalRows: importState.rows.length,
        importedCount,
        duplicateCount: importState.duplicatesCount,
        paidCount,
        pendingCount,
        scamCount,
        errorCount,
        totalRevenue,
        totalLoss,
        summary: {
          duplicateAction: action,
          warnings: importState.warnings
        }
      });
      await logActivity('IMPORT_CLIENTS', `Importou ${importedCount} clientes via planilha "${importState.fileName || ''}"`, 'spreadsheet_imports', null, importState.fileName || 'Planilha importada');
      if (errorCount > 0) {
        await logActivity('IMPORT_ERROR', `Importação "${importState.fileName || ''}" finalizada com ${errorCount} erro(s): ${firstErrorMessage || 'ver console'}`, 'spreadsheet_imports', null, importState.fileName || 'Planilha importada');
      }
    } catch (err) {
      console.error('Error logging import summary:', err);
    }

    state.clients = await window.db.getAll('clients');

    elements.sumTotalImported.textContent = importedCount;
    elements.sumPaid.textContent = paidCount;
    elements.sumPending.textContent = pendingCount;
    elements.sumScams.textContent = scamCount;
    elements.sumRevenue.textContent = formatCurrency(totalRevenue);
    elements.sumLoss.textContent = formatCurrency(totalLoss);
    elements.sumErrors.textContent = errorCount;

    updateDashboard();
    renderClientsList();

    showImportStage(4);
    if (errorCount > 0) {
      showToast(firstErrorMessage || `Erro ao importar planilha: ${errorCount} linha(s) falharam.`, 'error');
    } else {
      showToast('Importação de clientes finalizada!');
    }
    elements.btnImportNext.disabled = false;
  }

  function showImportStage(stageNum) {
    importState.currentStage = stageNum;
    
    document.querySelectorAll('.import-stage').forEach(el => {
      el.style.display = 'none';
    });
    
    document.getElementById(`importStage${stageNum}`).style.display = 'block';
    
    if (stageNum === 1) {
      elements.btnImportBack.style.display = 'none';
      elements.btnCancelImport.style.display = 'block';
      elements.btnCancelImport.textContent = 'Cancelar';
      elements.btnImportNext.style.display = 'block';
      elements.btnImportNext.textContent = 'Avançar';
    } else if (stageNum === 2) {
      elements.btnImportBack.style.display = 'block';
      elements.btnCancelImport.style.display = 'block';
      elements.btnCancelImport.textContent = 'Cancelar';
      elements.btnImportNext.style.display = 'block';
      elements.btnImportNext.textContent = 'Avançar';
    } else if (stageNum === 3) {
      elements.btnImportBack.style.display = 'block';
      elements.btnCancelImport.style.display = 'block';
      elements.btnCancelImport.textContent = 'Cancelar';
      elements.btnImportNext.style.display = 'block';
      elements.btnImportNext.textContent = 'Importar Dados';
    } else if (stageNum === 4) {
      elements.btnImportBack.style.display = 'none';
      elements.btnCancelImport.style.display = 'none';
      elements.btnImportNext.style.display = 'block';
      elements.btnImportNext.textContent = 'Concluir';
    }
  }

  // Navigation Event Listeners
  elements.btnImportNext.addEventListener('click', () => {
    if (importState.currentStage === 1) {
      if (validateStage1()) {
        renderMappingFields();
        showImportStage(2);
      }
    } else if (importState.currentStage === 2) {
      if (validateStage2()) {
        generateImportPreview();
        showImportStage(3);
      }
    } else if (importState.currentStage === 3) {
      executeImport();
    } else if (importState.currentStage === 4) {
      closeImportModal();
    }
  });

  elements.importRefMonth.addEventListener('change', () => {
    generateImportPreview();
  });

  elements.importRefYear.addEventListener('change', () => {
    generateImportPreview();
  });

  elements.btnImportBack.addEventListener('click', () => {
    if (importState.currentStage === 2) {
      showImportStage(1);
    } else if (importState.currentStage === 3) {
      showImportStage(2);
    }
  });

  // ==========================================================================
  // PRODUCTS SECTION (CRUD & Modals)
  // ==========================================================================
  function renderProductsList() {
    const tableBody = elements.productsTableBody;
    tableBody.innerHTML = '';

    const searchQuery = elements.searchProductsInput.value.toLowerCase().trim();

    // Filter lists
    const filtered = state.products.filter(prod => {
      const matchesSearch = !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery) ||
        prod.nicho.toLowerCase().includes(searchQuery);
      return matchesSearch;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="table-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>Nenhum produto cadastrado</td></tr>`;
      return;
    }

    filtered.forEach(prod => {
      // Compile plans list display
      let plansDisplay = '';
      if (prod.plans && prod.plans.length > 0) {
        plansDisplay = prod.plans.map(p => `<span class="badge badge-neutral" style="margin:2px;">${escapeHTML(p.name)}: $${p.price}</span>`).join('');
      } else {
        plansDisplay = '<span class="text-muted" style="font-size:0.75rem;">Nenhum plano</span>';
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(prod.name)}</strong></td>
        <td>${escapeHTML(prod.nicho)}</td>
        <td>${escapeHTML(prod.attendants)}</td>
        <td><div style="display:flex; flex-wrap:wrap; max-width:280px;">${plansDisplay}</div></td>
        <td>${formatCurrency(prod.cost)}</td>
        <td><span class="badge ${prod.status === 'active' ? 'badge-success' : 'badge-neutral'}">${prod.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm btn-icon-only btn-edit-product" data-id="${prod.id}" title="Editar">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-danger btn-sm btn-icon-only btn-delete-product" data-id="${prod.id}" title="Excluir">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Bind edit/delete events
    tableBody.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
    });
  }

  // Product search listener
  elements.searchProductsInput.addEventListener('input', renderProductsList);

  // Dynamic Product Plans elements
  elements.btnAddPlanItem.addEventListener('click', () => addPlanRow());

  function addPlanRow(name = '', price = '') {
    const row = document.createElement('div');
    row.className = 'plan-item-row';
    row.innerHTML = `
      <input type="text" class="form-input plan-name-input" placeholder="Ex: Plano 2 meses" value="${escapeHTML(name)}" required>
      <input type="number" step="0.01" class="form-input plan-price-input" placeholder="Valor ($)" value="${escapeHTML(price)}" required min="0">
      <button type="button" class="btn btn-danger btn-sm btn-icon-only btn-remove-plan-row" title="Remover">
        <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    elements.plansListWrapper.appendChild(row);

    // Bind remove button
    row.querySelector('.btn-remove-plan-row').addEventListener('click', () => {
      row.remove();
    });
  }

  // Product CRUD Action listeners
  elements.btnOpenAddProductModal.addEventListener('click', () => openProductModal());
  elements.btnCancelProductModal.addEventListener('click', closeProductModal);
  elements.btnCloseProductModal.addEventListener('click', closeProductModal);

  function openProductModal(id = null) {
    elements.productForm.reset();
    elements.plansListWrapper.innerHTML = ''; // clear dynamic plans

    if (id) {
      state.editingProductId = Number(id);
      elements.productModalTitle.textContent = 'Editar Produto';
      
      const prod = state.products.find(p => Number(p.id) === Number(id));
      if (prod) {
        elements.prodId.value = prod.id;
        elements.prodName.value = prod.name;
        elements.prodNiche.value = prod.nicho;
        elements.prodCost.value = Number(prod.cost).toFixed(2);
        elements.prodStatus.value = prod.status;
        elements.prodAttendants.value = prod.attendants;

        // Render existing plans
        if (prod.plans && prod.plans.length > 0) {
          prod.plans.forEach(plan => addPlanRow(plan.name, plan.price));
        }
      }
    } else {
      state.editingProductId = null;
      elements.prodId.value = '';
      elements.productModalTitle.textContent = 'Cadastrar Produto';
      // Default to 1 empty plan row
      addPlanRow('', '');
    }

    elements.productModal.classList.add('active');
  }

  function closeProductModal() {
    elements.productModal.classList.remove('active');
  }

  elements.productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather plans array
    const planRows = elements.plansListWrapper.querySelectorAll('.plan-item-row');
    const plans = [];
    
    planRows.forEach(row => {
      const name = row.querySelector('.plan-name-input').value.trim();
      const price = Number(row.querySelector('.plan-price-input').value) || 0;
      if (name) {
        plans.push({ name, price });
      }
    });

    if (plans.length === 0) {
      showToast('Adicione pelo menos um plano ao produto.', 'error');
      return;
    }

    const productData = {
      name: elements.prodName.value.trim(),
      nicho: elements.prodNiche.value.trim(),
      cost: Number(elements.prodCost.value) || 0,
      status: elements.prodStatus.value,
      attendants: elements.prodAttendants.value.trim(),
      plans: plans
    };

    if (!productData.name || !productData.nicho || !productData.attendants) {
      showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
      return;
    }

    try {
      if (state.editingProductId) {
        productData.id = state.editingProductId;
        await window.db.put('products', productData);
        showToast('Produto atualizado com sucesso!');
      } else {
        await window.db.add('products', productData);
        showToast('Produto cadastrado com sucesso!');
      }
      closeProductModal();
      loadViewData('products');
    } catch (err) {
      showToast('Erro ao salvar produto.', 'error');
      console.error(err);
    }
  });

  async function deleteProduct(id) {
    // Check if there are clients associated with this product
    const productClients = state.clients.filter(c => String(c.productId) === String(id));
    if (productClients.length > 0) {
      showToast('Não é possível excluir este produto, pois existem clientes vinculados a ele.', 'error');
      return;
    }

    if (confirm('Tem certeza de que deseja excluir este produto?')) {
      try {
        await window.db.delete('products', id);
        showToast('Produto removido.');
        loadViewData('products');
      } catch (err) {
        showToast('Erro ao excluir produto.', 'error');
      }
    }
  }

  // ==========================================================================
  // EXPENSES SECTION (CRUD & Modals)
  // ==========================================================================
  function populateExpenseFilters() {
    if (!elements.filterExpenseProduct || !elements.filterExpenseClient || !elements.filterExpenseAttendant) return;

    // 1. Populate products
    const prevProduct = elements.filterExpenseProduct.value || 'all';
    elements.filterExpenseProduct.innerHTML = '<option value="all">Todos</option>';
    state.products.forEach(prod => {
      const opt = document.createElement('option');
      opt.value = prod.id;
      opt.textContent = prod.name;
      elements.filterExpenseProduct.appendChild(opt);
    });
    elements.filterExpenseProduct.value = prevProduct;

    // 2. Populate clients
    const prevClient = elements.filterExpenseClient.value || 'all';
    elements.filterExpenseClient.innerHTML = '<option value="all">Todos</option>';
    state.clients
      .slice()
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR'))
      .forEach(client => {
        const opt = document.createElement('option');
        opt.value = client.id;
        opt.textContent = client.name || `Cliente #${client.id}`;
        elements.filterExpenseClient.appendChild(opt);
      });
    elements.filterExpenseClient.value = prevClient;

    // 3. Populate attendants
    const prevAttendant = elements.filterExpenseAttendant.value || 'all';
    elements.filterExpenseAttendant.innerHTML = '<option value="all">Todos</option>';
    
    // Get unique attendant names
    const attendants = new Set();
    state.clients.forEach(c => {
      if (c.attendant) attendants.add(c.attendant.trim());
    });
    state.products.forEach(p => {
      if (p.attendants && Array.isArray(p.attendants)) {
        p.attendants.forEach(att => attendants.add(att.trim()));
      } else if (typeof p.attendants === 'string') {
        p.attendants.split(',').map(att => att.trim()).filter(Boolean).forEach(att => attendants.add(att));
      }
    });

    Array.from(attendants).sort().forEach(att => {
      const opt = document.createElement('option');
      opt.value = att;
      opt.textContent = att;
      elements.filterExpenseAttendant.appendChild(opt);
    });
    elements.filterExpenseAttendant.value = prevAttendant;
  }

  function renderExpensesList() {
    const tableBody = elements.expensesTableBody;
    tableBody.innerHTML = '';

    const searchQuery = elements.searchExpensesInput.value.toLowerCase().trim();
    const typeVal = elements.filterExpenseType.value;
    const prodVal = elements.filterExpenseProduct.value;
    const clientVal = elements.filterExpenseClient.value;
    const attVal = elements.filterExpenseAttendant.value;
    const bottlesVal = elements.filterExpenseBottles.value;
    const periodVal = elements.filterExpensePeriod.value;
    const startVal = elements.filterExpenseStartDate.value;
    const endVal = elements.filterExpenseEndDate.value;

    let filterStart = null;
    let filterEnd = null;
    if (periodVal !== 'all') {
      const range = getDateRange(periodVal, startVal, endVal);
      filterStart = range.start;
      filterEnd = range.end;
    }

    // Filter list
    const filtered = state.expenses.filter(exp => {
      // 1. Text search (on name, category, observation)
      const matchesSearch = !searchQuery ||
        exp.name.toLowerCase().includes(searchQuery) ||
        exp.category.toLowerCase().includes(searchQuery) ||
        (exp.observation && exp.observation.toLowerCase().includes(searchQuery));
      if (!matchesSearch) return false;

      // 2. Type Filter (manual vs auto)
      if (typeVal === 'manual' && exp.autoGenerated) return false;
      if (typeVal === 'auto' && !exp.autoGenerated) return false;

      // 3. Product Filter
      if (prodVal !== 'all') {
        if (String(exp.productId) !== prodVal) return false;
      }

      // Find related client if autoGenerated or if has clientId
      const client = exp.clientId ? state.clients.find(c => c.id === exp.clientId) : null;

      // 4. Client Filter
      if (clientVal !== 'all') {
        if (!client || String(client.id) !== String(clientVal)) return false;
      }

      // 5. Attendant/Vendedor Filter
      if (attVal !== 'all') {
        if (!client || client.attendant !== attVal) return false;
      }

      // 6. Bottles Filter
      if (bottlesVal !== 'all') {
        const bottlesCount = client ? Number(client.bottles) : 0;
        if (bottlesVal === 'other') {
          if ([1, 3, 6, 9, 12].includes(bottlesCount)) return false;
        } else {
          if (bottlesCount !== Number(bottlesVal)) return false;
        }
      }

      // 7. Period Filter
      if (periodVal !== 'all') {
        const expDate = parseLocalDate(exp.date);
        if (expDate < filterStart || expDate > filterEnd) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" class="table-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>Nenhuma despesa encontrada</td></tr>`;
      return;
    }

    filtered.forEach(exp => {
      const client = exp.clientId ? state.clients.find(c => String(c.id) === String(exp.clientId)) : null;
      let prodName = 'Nenhum';
      if (exp.productId) {
        const prod = state.products.find(p => String(p.id) === String(exp.productId));
        if (prod) prodName = prod.name;
      }

      // Display origin: Manual vs Automatic
      const originDisplay = exp.autoGenerated
        ? `<span class="badge badge-success" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">Automática</span>`
        : `<span class="badge badge-neutral">Manual</span>`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(exp.name)}</strong></td>
        <td><span class="badge badge-neutral">${escapeHTML(exp.category)}</span></td>
        <td>${originDisplay}</td>
        <td><strong class="text-danger">${formatCurrency(exp.value)}</strong></td>
        <td>${formatDateDisplay(exp.date)}</td>
        <td>${escapeHTML(prodName)}</td>
        <td>${escapeHTML(client ? client.name : '-')}</td>
        <td><div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHTML(exp.observation || '')}">${escapeHTML(exp.observation || '-')}</div></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm btn-icon-only btn-edit-expense" data-id="${exp.id}" title="Editar">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-danger btn-sm btn-icon-only btn-delete-expense" data-id="${exp.id}" title="Excluir">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Bind edit/delete click handlers
    tableBody.querySelectorAll('.btn-edit-expense').forEach(btn => {
      btn.addEventListener('click', () => openExpenseModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-delete-expense').forEach(btn => {
      btn.addEventListener('click', () => deleteExpense(btn.getAttribute('data-id')));
    });
  }

  // Expense filters and search listeners
  elements.searchExpensesInput.addEventListener('input', renderExpensesList);
  elements.filterExpenseType.addEventListener('change', renderExpensesList);
  elements.filterExpenseProduct.addEventListener('change', renderExpensesList);
  elements.filterExpenseClient.addEventListener('change', renderExpensesList);
  elements.filterExpenseAttendant.addEventListener('change', renderExpensesList);
  elements.filterExpenseBottles.addEventListener('change', renderExpensesList);
  
  elements.filterExpensePeriod.addEventListener('change', (e) => {
    const val = e.target.value;
    const dateGroups = document.querySelectorAll('.filter-expense-date-group');
    if (val === 'custom') {
      dateGroups.forEach(el => el.style.display = 'block');
    } else {
      dateGroups.forEach(el => el.style.display = 'none');
    }
    renderExpensesList();
  });

  elements.filterExpenseStartDate.addEventListener('change', renderExpensesList);
  elements.filterExpenseEndDate.addEventListener('change', renderExpensesList);

  // Expense CRUD Action listeners
  elements.btnOpenAddExpenseModal.addEventListener('click', () => openExpenseModal());
  elements.btnCancelExpenseModal.addEventListener('click', closeExpenseModal);
  elements.btnCloseExpenseModal.addEventListener('click', closeExpenseModal);

  function openExpenseModal(id = null) {
    elements.expenseForm.reset();
    
    // Set default date to today
    elements.expenseDate.value = getISODateString(new Date());

    if (id) {
      state.editingExpenseId = Number(id);
      elements.expenseModalTitle.textContent = 'Editar Despesa';
      
      const exp = state.expenses.find(e => Number(e.id) === Number(id));
      if (exp) {
        elements.expenseId.value = exp.id;
        elements.expenseName.value = exp.name;
        elements.expenseCategory.value = exp.category;
        elements.expenseValue.value = Number(exp.value).toFixed(2);
        elements.expenseDate.value = exp.date;
        elements.expenseProduct.value = exp.productId || '';
        elements.expenseObs.value = exp.observation || '';
      }
    } else {
      state.editingExpenseId = null;
      elements.expenseId.value = '';
      elements.expenseModalTitle.textContent = 'Adicionar Despesa';
    }

    elements.expenseModal.classList.add('active');
  }

  function closeExpenseModal() {
    elements.expenseModal.classList.remove('active');
  }

  elements.expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const existingExpense = state.editingExpenseId
      ? state.expenses.find(e => Number(e.id) === Number(state.editingExpenseId))
      : null;

    const expenseData = {
      ...(existingExpense || {}),
      name: elements.expenseName.value.trim(),
      category: elements.expenseCategory.value,
      value: Number(elements.expenseValue.value) || 0,
      date: elements.expenseDate.value,
      productId: elements.expenseProduct.value ? Number(elements.expenseProduct.value) : null,
      observation: elements.expenseObs.value.trim()
    };

    if (!expenseData.name || !expenseData.category || !expenseData.value || !expenseData.date) {
      showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
      return;
    }

    try {
      if (state.editingExpenseId) {
        expenseData.id = state.editingExpenseId;
        await window.db.put('expenses', expenseData);
        showToast('Despesa atualizada com sucesso!');
      } else {
        await window.db.add('expenses', expenseData);
        showToast('Despesa cadastrada com sucesso!');
      }
      closeExpenseModal();
      loadViewData('expenses');
    } catch (err) {
      showToast('Erro ao salvar despesa.', 'error');
      console.error(err);
    }
  });

  async function deleteExpense(id) {
    if (confirm('Tem certeza de que deseja excluir esta despesa?')) {
      try {
        await window.db.delete('expenses', id);
        showToast('Despesa removida.');
        loadViewData('expenses');
      } catch (err) {
        showToast('Erro ao excluir despesa.', 'error');
      }
    }
  }

  // ==========================================================================
  // AUTHENTICATION & SUPABASE INTEGRATION
  // ==========================================================================
  const supabase = window.db.getSupabaseClient ? window.db.getSupabaseClient() : null;

  async function logActivity(actionType, description, targetType = null, targetId = null, targetName = '') {
    if (!authState.user) return;
    
    try {
      const safeTargetId = targetId !== undefined && targetId !== null && targetId !== ''
        ? String(targetId)
        : null;
      const numericTargetId = safeTargetId !== null ? Number(safeTargetId) : NaN;
      const legacyEntityId = Number.isFinite(numericTargetId) ? numericTargetId : null;
      const actorRole = normalizeUserRole(authState.user.role);

      const logData = {
        employeeId: authState.user.profileId || null,
        actorUserId: authState.user.profileId || authState.user.id || null,
        actorEmail: authState.user.email || '',
        actorRole,
        actionType: actionType,
        description: description,
        entityType: targetType || '',
        entityId: legacyEntityId,
        targetType: targetType || '',
        targetId: safeTargetId,
        targetName: targetName || '',
        createdAt: new Date().toISOString(),
        ipAddress: '',
        userAgent: navigator.userAgent
      };
      
      await window.db.add('employee_activity_logs', logData);
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }
  }

  function normalizeUserRole(role) {
    const normalized = normalizeImportText(role);
    if (['admin', 'administrador'].includes(normalized)) {
      return 'admin';
    }
    return 'funcionario';
  }

  function isEmployeeRole(role) {
    const normalized = normalizeImportText(role);
    return ['employee', 'funcionario'].includes(normalized);
  }

  function getDisplayUserRole(role) {
    return normalizeUserRole(role) === 'admin' ? 'Administrador' : 'Funcionário';
  }

  function normalizeAccessProfile(profile) {
    if (!profile) return null;
    return {
      ...profile,
      role: normalizeUserRole(profile.role),
      status: profile.status || 'active',
      name: profile.name || profile.fullName || profile.email || 'Usuário'
    };
  }

  function getFriendlyAuthErrorMessage(err) {
    const message = String(err?.message || err || '');
    const lower = message.toLowerCase();

    if (
      lower.includes('cannot coerce the result to a single json object') ||
      lower.includes('json object') ||
      lower.includes('pgrst116') ||
      lower.includes('profiles')
    ) {
      return 'Não foi possível carregar seu perfil de acesso. Verifique se este usuário foi cadastrado como admin ou funcionário.';
    }

    if (lower.includes('invalid login credentials')) {
      return 'E-mail ou senha inválidos.';
    }

    if (lower.includes('email not confirmed')) {
      return 'Este e-mail ainda não foi confirmado no Supabase.';
    }

    if (lower.includes('desativada') || lower.includes('inactive')) {
      return 'Seu acesso está desativado. Fale com o administrador.';
    }

    return message || 'Não foi possível fazer login. Tente novamente.';
  }

  async function saveProfileAccessTimestamps(profile, { login = false } = {}) {
    if (!profile) return profile;

    const now = new Date().toISOString();
    const updatedProfile = {
      ...profile,
      lastLoginAt: login ? now : profile.lastLoginAt,
      lastActivityAt: now
    };

    try {
      await window.db.put('profiles', updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.warn('[Help Vitall][Auth] Não foi possível atualizar último acesso do perfil.', err);
      return profile;
    }
  }

  function applyRolePermissions() {
    if (!authState.user) return;
    const role = authState.user.role || 'funcionario';

    // Show/hide sidebar navigation items
    elements.sidebarItems.forEach(item => {
      const view = item.getAttribute('data-view');
      const adminOnlyViews = ['products', 'expenses', 'reports', 'settings', 'employees'];
      if (adminOnlyViews.includes(view)) {
        if (role === 'admin') {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      }
    });
  }

  async function loadUserProfile(user) {
    if (!user) return null;
    
    // In local dev mode (no Supabase)
    if (!supabase) {
      const allProfiles = await window.db.getAll('profiles');
      let profile = allProfiles.find(p => p.email === user.email);
      if (!profile) {
        if (user.role === 'admin') {
          const newId = await window.db.add('profiles', {
            auth_user_id: 'local-admin',
            name: 'Administrador Local',
            email: 'admin@helpvitall.com',
            role: 'admin',
            status: 'active',
            created_at: new Date().toISOString()
          });
          profile = {
            id: newId,
            auth_user_id: 'local-admin',
            name: 'Administrador Local',
            email: 'admin@helpvitall.com',
            role: 'admin',
            status: 'active'
          };
        } else {
          return null;
        }
      }
      return profile;
    }

    // Supabase mode
    try {
      const profile = await window.db.get('profiles', user.id);
      if (profile) {
        return normalizeAccessProfile(profile);
      }

      const visibleProfiles = await window.db.getAll('profiles');
      const emailMatches = visibleProfiles.filter(profile => {
        return String(profile.email || '').toLowerCase() === String(user.email || '').toLowerCase();
      });

      if (emailMatches.length > 1) {
        throw new Error('Existe mais de um perfil cadastrado para este e-mail. Verifique a tabela profiles no Supabase.');
      }

      if (emailMatches.length === 1) {
        return normalizeAccessProfile(emailMatches[0]);
      }

      return null;
    } catch (err) {
      console.error('Error loading user profile:', err);
      throw new Error('Não foi possível carregar seu perfil de acesso. Verifique se este usuário foi cadastrado como admin ou funcionário.');
    }
  }

  async function checkSession() {
    if (!supabase) {
      console.warn("Supabase not configured. Using local bypass mode for development.");
      const profile = await loadUserProfile({ email: 'admin@helpvitall.com', role: 'admin' });
      authState.user = { 
        id: 'local-admin', 
        email: 'admin@helpvitall.com', 
        role: profile?.role || 'admin',
        profileId: profile?.id || 1,
        name: profile?.name || 'Administrador Local'
      };
      applyRolePermissions();
      return true;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data?.session) {
        const user = data.session.user;
        const profile = await loadUserProfile(user);
        
        if (!profile) {
          showToast('Perfil de acesso não encontrado. Verifique se este usuário foi cadastrado como admin ou funcionário.', 'error');
          await supabase.auth.signOut();
          return false;
        }
        
        if (profile.status === 'inactive') {
          showToast('Seu acesso está desativado. Fale com o administrador.', 'error');
          await supabase.auth.signOut();
          return false;
        }

        authState.user = { 
          id: user.id, 
          email: user.email, 
          role: profile.role,
          profileId: profile.id,
          name: profile.name
        };
        applyRolePermissions();
        
        // Update last activity
        await saveProfileAccessTimestamps(profile);
        
        return true;
      }
    } catch (err) {
      console.error("Error checking Supabase session:", err);
    }

    return false;
  }

  async function loginUser(email, password) {
    email = email.trim();
    if (!supabase) {
      const allProfiles = await window.db.getAll('profiles');
      let profile = allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      
      if (allProfiles.length === 0 && email.toLowerCase() === 'admin@helpvitall.com') {
        const adminId = await window.db.add('profiles', {
          auth_user_id: 'local-admin',
          name: 'Administrador Local',
          email: 'admin@helpvitall.com',
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString()
        });
        profile = {
          id: adminId,
          authUserId: 'local-admin',
          name: 'Administrador Local',
          email: 'admin@helpvitall.com',
          role: 'admin',
          status: 'active'
        };
      }

      if (!profile) {
        throw new Error('Usuário não cadastrado localmente.');
      }

      if (profile.status === 'inactive') {
        throw new Error('Esta conta foi desativada pelo administrador.');
      }

      authState.user = { 
        id: profile.authUserId || 'local-admin', 
        email: profile.email, 
        role: profile.role,
        profileId: profile.id,
        name: profile.name
      };
      
      applyRolePermissions();
      
      await saveProfileAccessTimestamps(profile, { login: true });
      
      await logActivity('LOGIN', `${getDisplayUserRole(profile.role)} ${profile.name} fez login no painel local.`, 'auth', profile.id, profile.name || profile.email);

      return authState.user;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.user;
    const profile = await loadUserProfile(user);

    if (!profile) {
      await supabase.auth.signOut();
      throw new Error('Perfil de acesso não encontrado. Verifique se este usuário foi cadastrado como admin ou funcionário.');
    }

    if (profile.status === 'inactive') {
      await supabase.auth.signOut();
      throw new Error('Seu acesso está desativado. Fale com o administrador.');
    }

    authState.user = { 
      id: user.id, 
      email: user.email, 
      role: profile.role,
      profileId: profile.id,
      name: profile.name
    };

    applyRolePermissions();

    await saveProfileAccessTimestamps(profile, { login: true });

    await logActivity('LOGIN', `${getDisplayUserRole(profile.role)} ${profile.name} fez login no painel.`, 'auth', profile.id, profile.name || profile.email);

    return authState.user;
  }

  async function logoutUser() {
    if (authState.user) {
      await logActivity('LOGOUT', `${getDisplayUserRole(authState.user.role)} ${authState.user.name} saiu do painel.`, 'auth', authState.user.profileId || authState.user.id, authState.user.name || authState.user.email);
    }
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signOut error:", err);
      }
    }
    authState.user = null;
    showToast('Sessão encerrada.');
    showLoginScreen();
  }

  function showLoginScreen() {
    elements.loginContainer.classList.remove('auth-hidden');
    elements.sidebar.classList.add('auth-hidden');
    elements.mainContainer.classList.add('auth-hidden');
    elements.headerUserProfile.style.display = 'none';
  }

  function hideLoginScreen() {
    elements.loginContainer.classList.add('auth-hidden');
    elements.sidebar.classList.remove('auth-hidden');
    elements.mainContainer.classList.remove('auth-hidden');
  }

  // Handle Login submission
  elements.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = elements.loginEmail.value;
    const password = elements.loginPassword.value;
    
    elements.loginErrorMsg.style.display = 'none';
    elements.loginErrorMsg.textContent = '';
    elements.loginSpinner.style.display = 'inline-block';
    elements.btnLoginSubmit.disabled = true;
    
    try {
      await loginUser(email, password);
      showToast('Bem-vindo ao Help Vitall!');
      await loadMainSystemData();
    } catch (err) {
      console.error('[Help Vitall][Auth] Login error:', err);
      elements.loginErrorMsg.textContent = getFriendlyAuthErrorMessage(err);
      elements.loginErrorMsg.style.display = 'block';
    } finally {
      elements.loginSpinner.style.display = 'none';
      elements.btnLoginSubmit.disabled = false;
    }
  });

  // Handle Logout click
  elements.btnHeaderLogout.addEventListener('click', () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      logoutUser();
    }
  });

  async function loadMainSystemData() {
    hideLoginScreen();
    elements.headerUserEmail.textContent = authState.user.email;
    elements.headerUserRole.textContent = authState.user.role === 'admin' ? 'Administrador' : 'Funcionário';
    elements.headerUserProfile.style.display = 'flex';

    // 1. Load configurations
    await loadSettings();
    applyRolePermissions();

    // 2. Fetch all collections
    const isAdmin = authState.user.role === 'admin';
    state.products = await window.db.getAll('products');
    state.clients = await window.db.getAll('clients');
    state.expenses = isAdmin ? await window.db.getAll('expenses') : [];
    
    // Load and seed product cost rules if needed
    state.productCostRules = isAdmin ? await window.db.getAll('product_cost_rules') : [];
    if (isAdmin && state.productCostRules.length === 0) {
      for (const rule of DEFAULT_COST_RULES) {
        await window.db.add('product_cost_rules', rule);
      }
      state.productCostRules = await window.db.getAll('product_cost_rules');
    }

    // 3. Render default view
    navigateTo('dashboard');
  }

  // ==========================================================================
  // EMPLOYEE MANAGEMENT (ADMIN ONLY)
  // ==========================================================================
  let editingEmployeeId = null;

  function openEmployeeModal(id = null) {
    editingEmployeeId = id;
    elements.employeeForm.reset();
    
    if (supabase) {
      elements.supabaseEmployeeAlert.style.display = 'block';
      elements.employeePasswordSection.style.display = 'none';
      elements.employeePassword.required = false;
      elements.employeeConfirmPassword.required = false;
    } else {
      elements.supabaseEmployeeAlert.style.display = 'none';
      elements.employeePasswordSection.style.display = 'flex';
      elements.employeePassword.required = !id;
      elements.employeeConfirmPassword.required = !id;
    }

    if (id) {
      elements.employeeModalTitle.textContent = 'Editar Funcionário';
      const profile = state.profiles.find(p => String(p.id) === String(id));
      if (profile) {
        elements.employeeName.value = profile.name;
        elements.employeeEmail.value = profile.email;
        elements.employeePhone.value = profile.phone || '';
        elements.employeePosition.value = profile.position || '';
        elements.employeeStatus.value = profile.status || 'active';
      }
    } else {
      elements.employeeModalTitle.textContent = 'Cadastrar Funcionário';
    }

    elements.employeeModal.classList.add('active');
  }

  function closeEmployeeModal() {
    elements.employeeModal.classList.remove('active');
    editingEmployeeId = null;
  }

  async function toggleEmployeeStatus(id) {
    const profile = state.profiles.find(p => String(p.id) === String(id));
    if (!profile) return;
    
    if (profile.role === 'admin') {
      showToast('Não é possível desativar uma conta de administrador.', 'error');
      return;
    }

    const newStatus = profile.status === 'active' ? 'inactive' : 'active';
    const actionLabel = newStatus === 'active' ? 'ativado' : 'desativado';

    try {
      profile.status = newStatus;
      await window.db.put('profiles', profile);
      showToast(`Funcionário ${actionLabel} com sucesso!`);
      await logActivity('STATUS_CHANGE', `Alterou status do funcionário ${profile.name} para ${newStatus}`, 'profiles', profile.id, profile.name || profile.email);
      await loadViewData('employees');
    } catch (err) {
      showToast('Erro ao atualizar status do funcionário.', 'error');
    }
  }

  function renderEmployeesList() {
    const tableBody = elements.employeesTableBody;
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const searchQuery = elements.searchEmployeesInput.value.toLowerCase().trim();
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = state.profiles.filter(profile => {
      if (!isEmployeeRole(profile.role)) return false;
      const profileName = String(profile.name || profile.fullName || '');
      const profileEmail = String(profile.email || '');
      const profilePosition = String(profile.position || '');
      const matchesSearch = !searchQuery ||
        profileName.toLowerCase().includes(searchQuery) ||
        profileEmail.toLowerCase().includes(searchQuery) ||
        profilePosition.toLowerCase().includes(searchQuery);
      return matchesSearch;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="table-empty">Nenhum funcionário cadastrado</td></tr>`;
      renderEmployeeActivityLogs();
      return;
    }

    filtered.forEach(profile => {
      const manualCount = state.clients.filter(c => {
        if (!c.date) return false;
        const cDate = c.date.split('T')[0];
        return String(c.createdById) === String(profile.id) && c.creationSource === 'manual' && cDate === todayStr;
      }).length;

      const importCount = state.clients.filter(c => {
        if (!c.date) return false;
        const cDate = c.date.split('T')[0];
        return String(c.createdById) === String(profile.id) && c.creationSource === 'spreadsheet' && cDate === todayStr;
      }).length;

      const statusBadge = profile.status === 'active' ? 'badge-success' : 'badge-danger';
      const statusLabel = profile.status === 'active' ? 'Ativo' : 'Inativo';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <strong>${escapeHTML(profile.name)}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(profile.email)}</div>
        </td>
        <td>
          <div>${escapeHTML(profile.position || 'Funcionário')}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(profile.phone || '-')}</div>
        </td>
        <td><span class="badge ${statusBadge}">${statusLabel}</span></td>
        <td>${formatDateTimeLabel(profile.lastLoginAt || profile.last_login_at, 'Nunca')}</td>
        <td>${formatDateTimeLabel(profile.lastActivityAt || profile.last_activity_at, 'Nunca')}</td>
        <td><span class="badge badge-neutral">${manualCount}</span></td>
        <td><span class="badge badge-neutral">${importCount}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm btn-icon-only btn-edit-employee" data-id="${profile.id}" title="Editar">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-sm btn-icon-only ${profile.status === 'active' ? 'btn-danger' : 'btn-success'} btn-toggle-employee" data-id="${profile.id}" title="${profile.status === 'active' ? 'Desativar' : 'Ativar'}">
              ${profile.status === 'active' ? 
                `<svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>` : 
                `<svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
              }
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    tableBody.querySelectorAll('.btn-edit-employee').forEach(btn => {
      btn.addEventListener('click', () => openEmployeeModal(btn.getAttribute('data-id')));
    });

    tableBody.querySelectorAll('.btn-toggle-employee').forEach(btn => {
      btn.addEventListener('click', () => toggleEmployeeStatus(btn.getAttribute('data-id')));
    });

    renderEmployeeActivityLogs();
  }

  function getActivityLabel(actionType) {
    const labels = {
      LOGIN: 'Login',
      LOGOUT: 'Logout',
      ADD_CLIENT: 'Cliente criado',
      EDIT_CLIENT: 'Cliente editado',
      DELETE_CLIENT: 'Cliente apagado',
      MARK_CLIENT_PAID: 'Cliente pago',
      MARK_CLIENT_SCAM: 'Cliente golpe',
      CLIENT_STATUS_CHANGE: 'Status alterado',
      IMPORT_CLIENTS: 'Planilha importada',
      IMPORT_ERROR: 'Erro na importação',
      STATUS_CHANGE: 'Status funcionário',
      CREATE_EMPLOYEE: 'Funcionário criado',
      EDIT_EMPLOYEE: 'Funcionário editado'
    };
    return labels[actionType] || actionType || '-';
  }

  function getActivityTargetTypeLabel(targetType) {
    const normalized = normalizeImportText(targetType);
    const labels = {
      auth: 'Autenticação',
      clients: 'Clientes',
      client: 'Clientes',
      cliente: 'Clientes',
      profiles: 'Funcionários',
      profile: 'Funcionários',
      funcionario: 'Funcionários',
      employee: 'Funcionários',
      employees: 'Funcionários',
      spreadsheet_imports: 'Importação de planilha',
      importacao: 'Importação de planilha',
      import: 'Importação de planilha'
    };
    return labels[normalized] || targetType || '-';
  }

  function getActivityTargetName(log) {
    if (log.targetName) return log.targetName;

    const targetType = log.targetType || log.entityType || '';
    const targetId = log.targetId || log.entityId;
    const normalizedType = normalizeImportText(targetType);

    if (!targetId) return '-';

    if (['clients', 'client', 'cliente'].includes(normalizedType)) {
      const client = state.clients.find(c => String(c.id) === String(targetId));
      return client?.name || `Cliente ${targetId}`;
    }

    if (['profiles', 'profile', 'funcionario', 'employee', 'employees'].includes(normalizedType)) {
      const profile = state.profiles.find(p => String(p.id) === String(targetId));
      return profile?.name || profile?.email || `Funcionário ${targetId}`;
    }

    if (normalizedType === 'auth') {
      const profile = state.profiles.find(p => String(p.id) === String(targetId));
      return profile?.email || profile?.name || `Usuário ${targetId}`;
    }

    return `${getActivityTargetTypeLabel(targetType)} ${targetId}`;
  }

  function renderEmployeeActivityLogs() {
    const tableBody = document.getElementById('employeeActivityLogsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const logs = (state.activityLogs || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 50);

    if (logs.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="table-empty">Nenhuma atividade registrada</td></tr>';
      return;
    }

    logs.forEach(log => {
      const actorId = log.actorUserId || log.employeeId;
      const actorProfile = state.profiles.find(p => String(p.id) === String(actorId));
      const actorEmail = log.actorEmail || actorProfile?.email || actorProfile?.name || 'Sistema';
      const actorRoleLabel = getDisplayUserRole(log.actorRole || actorProfile?.role || 'funcionario');
      const targetType = log.targetType || log.entityType || '';
      const targetName = getActivityTargetName(log);
      const dateLabel = formatDateTimeLabel(log.createdAt);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${dateLabel}</td>
        <td>${escapeHTML(actorEmail)}</td>
        <td><span class="badge badge-neutral">${escapeHTML(actorRoleLabel)}</span></td>
        <td><span class="badge badge-neutral">${escapeHTML(getActivityLabel(log.actionType))}</span></td>
        <td>${escapeHTML(targetName)}</td>
        <td>${escapeHTML(log.description || '-')}</td>
        <td>${escapeHTML(getActivityTargetTypeLabel(targetType))}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  elements.employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = elements.employeeName.value.trim();
    const email = elements.employeeEmail.value.trim().toLowerCase();
    const phone = elements.employeePhone.value.trim();
    const position = elements.employeePosition.value.trim();
    const status = elements.employeeStatus.value;
    const password = elements.employeePassword.value;
    const confirmPassword = elements.employeeConfirmPassword.value;

    if (!supabase && !editingEmployeeId) {
      if (password.length < 6) {
        showToast('A senha deve conter no mínimo 6 caracteres.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('As senhas não coincidem.', 'error');
        return;
      }
    }

    try {
      if (editingEmployeeId) {
        const originalProfile = state.profiles.find(p => String(p.id) === String(editingEmployeeId));
        if (!originalProfile || !isEmployeeRole(originalProfile.role)) {
          showToast('Este perfil não é um funcionário.', 'error');
          return;
        }
        const updatedProfile = {
          ...originalProfile,
          name,
          email,
          phone,
          position,
          status,
          updated_at: new Date().toISOString()
        };
        await window.db.put('profiles', updatedProfile);
        showToast('Funcionário atualizado com sucesso!');
        await logActivity('EDIT_EMPLOYEE', `Editou os dados do funcionário ${name}`, 'profiles', editingEmployeeId, name || email);
      } else {
        const emailExists = state.profiles.some(p => p.email.toLowerCase() === email);
        if (emailExists) {
          const existingProfile = state.profiles.find(p => p.email.toLowerCase() === email);
          if (!isEmployeeRole(existingProfile.role)) {
            showToast('Este e-mail pertence ao administrador e não pode ser usado como funcionário.', 'error');
            return;
          }
          await window.db.put('profiles', {
            ...existingProfile,
            name,
            email,
            phone,
            position,
            status,
            role: existingProfile.role || 'funcionario',
            updatedAt: new Date().toISOString()
          });
          showToast('Perfil do funcionário atualizado com sucesso!');
          await logActivity('EDIT_EMPLOYEE', `Atualizou o perfil do funcionário ${name}`, 'profiles', existingProfile.id, name || email);
          closeEmployeeModal();
          await loadViewData('employees');
          return;
        }

        if (supabase) {
          showToast('Crie primeiro o usuário em Supabase > Authentication > Users. Depois volte aqui para editar o perfil criado automaticamente.', 'error');
          return;
        }

        const profileData = {
          name,
          email,
          phone,
          position,
          status,
          role: 'funcionario',
          created_at: new Date().toISOString()
        };

        if (!supabase) {
          profileData.auth_user_id = 'local-' + Math.random().toString(36).substr(2, 9);
          profileData.password = password; 
        }

        const newId = await window.db.add('profiles', profileData);
        showToast('Funcionário cadastrado com sucesso!');
        await logActivity('CREATE_EMPLOYEE', `Cadastrou o funcionário ${name}`, 'profiles', newId, name || email);
      }

      closeEmployeeModal();
      await loadViewData('employees');
    } catch (err) {
      showToast('Erro ao salvar funcionário.', 'error');
      console.error(err);
    }
  });

  if (elements.btnOpenAddEmployeeModal) {
    elements.btnOpenAddEmployeeModal.addEventListener('click', () => openEmployeeModal());
  }
  if (elements.btnCancelEmployeeModal) {
    elements.btnCancelEmployeeModal.addEventListener('click', closeEmployeeModal);
  }
  if (elements.btnCloseEmployeeModal) {
    elements.btnCloseEmployeeModal.addEventListener('click', closeEmployeeModal);
  }
  if (elements.searchEmployeesInput) {
    elements.searchEmployeesInput.addEventListener('input', renderEmployeesList);
  }

  // ==========================================================================
  // EMPLOYEE DASHBOARD (EMPLOYEE ONLY)
  // ==========================================================================
  function populateEmployeeDashboardFilters() {
    const filter = document.getElementById('employeeDashboardPeriodFilter');
    const startInput = document.getElementById('employeeDashboardStartDate');
    const endInput = document.getElementById('employeeDashboardEndDate');
    const wrapper = document.getElementById('employeeDashboardCustomDateRangeWrapper');

    if (!filter || !startInput || !endInput || !wrapper) return;

    if (!startInput.value || !endInput.value) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      startInput.value = sevenDaysAgo.toISOString().split('T')[0];
      endInput.value = today.toISOString().split('T')[0];
    }
  }

  const empFilter = document.getElementById('employeeDashboardPeriodFilter');
  if (empFilter) {
    empFilter.addEventListener('change', (e) => {
      const wrapper = document.getElementById('employeeDashboardCustomDateRangeWrapper');
      if (wrapper) {
        wrapper.style.display = e.target.value === 'custom' ? 'flex' : 'none';
      }
      updateEmployeeDashboard();
    });
  }
  const empStart = document.getElementById('employeeDashboardStartDate');
  if (empStart) empStart.addEventListener('change', updateEmployeeDashboard);
  const empEnd = document.getElementById('employeeDashboardEndDate');
  if (empEnd) empEnd.addEventListener('change', updateEmployeeDashboard);

  function updateEmployeeDashboard() {
    const periodFilter = document.getElementById('employeeDashboardPeriodFilter')?.value || '7days';
    const startInput = document.getElementById('employeeDashboardStartDate')?.value;
    const endInput = document.getElementById('employeeDashboardEndDate')?.value;

    let startDate, endDate;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (periodFilter === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
    } else if (periodFilter === 'yesterday') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (periodFilter === '7days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
    } else if (periodFilter === '14days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
    } else if (periodFilter === '30days') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
    } else if (periodFilter === 'custom' && startInput && endInput) {
      startDate = new Date(startInput + 'T00:00:00');
      endDate = new Date(endInput + 'T23:59:59');
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
    }

    const seeAll = state.settings.employeeSeeAllClients;
    const employeeClients = state.clients.filter(c => {
      if (!seeAll && c.createdById && c.createdById !== authState.user.profileId) {
        return false;
      }
      return true;
    });

    const periodClients = employeeClients.filter(c => {
      if (!c.date) return false;
      const cDate = new Date(c.date + 'T12:00:00');
      return cDate >= startDate && cDate <= endDate;
    });

    const totalClients = periodClients.length;
    document.getElementById('empKpiTotalClientsVal').textContent = totalClients;

    const paidClients = periodClients.filter(c => c.status === 'Pago');
    const paidCount = paidClients.length;
    document.getElementById('empKpiPaidClientsVal').textContent = paidCount;
    const conversionRate = totalClients > 0 ? ((paidCount / totalClients) * 100).toFixed(1) : '0.0';
    document.getElementById('empKpiPaidClientsSub').textContent = `${conversionRate}% conversão`;

    const pendingCount = periodClients.filter(c => c.status === 'Pagamento pendente').length;
    document.getElementById('empKpiPendingClientsVal').textContent = pendingCount;

    const scamCount = periodClients.filter(c => c.status === 'Golpe').length;
    document.getElementById('empKpiScamClientsVal').textContent = scamCount;

    const todayStr = new Date().toISOString().split('T')[0];
    const addedToday = employeeClients.filter(c => {
      if (!c.date) return false;
      const cDate = c.date.split('T')[0];
      return cDate === todayStr && c.creationSource === 'manual';
    }).length;
    const importedToday = employeeClients.filter(c => {
      if (!c.date) return false;
      const cDate = c.date.split('T')[0];
      return cDate === todayStr && c.creationSource === 'spreadsheet';
    }).length;

    document.getElementById('empKpiAddedTodayVal').textContent = addedToday;
    document.getElementById('empKpiImportedTodayVal').textContent = importedToday;

    const productPerformance = {};
    periodClients.forEach(c => {
      const prodId = c.productId;
      if (!productPerformance[prodId]) {
        const prod = state.products.find(p => String(p.id) === String(prodId));
        productPerformance[prodId] = {
          name: prod ? prod.name : 'Desconhecido',
          sales: 0,
          revenue: 0,
          total: 0
        };
      }
      productPerformance[prodId].total += 1;
      if (c.status === 'Pago') {
        productPerformance[prodId].sales += 1;
        productPerformance[prodId].revenue += Number(c.saleValue) || 0;
      }
    });

    const prodTableBody = document.getElementById('empDashboardProductTableBody');
    if (prodTableBody) {
      prodTableBody.innerHTML = '';
      const prodRows = Object.values(productPerformance).sort((a, b) => b.revenue - a.revenue);
      if (prodRows.length === 0) {
        prodTableBody.innerHTML = '<tr><td colspan="4" class="table-empty">Sem dados</td></tr>';
      } else {
        prodRows.forEach(row => {
          const conv = row.total > 0 ? ((row.sales / row.total) * 100).toFixed(0) : '0';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${escapeHTML(row.name)}</strong></td>
            <td>${row.sales}</td>
            <td>${formatCurrency(row.revenue)}</td>
            <td>${conv}%</td>
          `;
          prodTableBody.appendChild(tr);
        });
      }
    }

    const attendantPerformance = {};
    periodClients.forEach(c => {
      const attName = c.attendant || 'Sem Atendente';
      if (!attendantPerformance[attName]) {
        attendantPerformance[attName] = {
          name: attName,
          sales: 0,
          revenue: 0,
          total: 0
        };
      }
      attendantPerformance[attName].total += 1;
      if (c.status === 'Pago') {
        attendantPerformance[attName].sales += 1;
        attendantPerformance[attName].revenue += Number(c.saleValue) || 0;
      }
    });

    const attTableBody = document.getElementById('empDashboardAttendantTableBody');
    if (attTableBody) {
      attTableBody.innerHTML = '';
      const attRows = Object.values(attendantPerformance).sort((a, b) => b.revenue - a.revenue);
      if (attRows.length === 0) {
        attTableBody.innerHTML = '<tr><td colspan="4" class="table-empty">Sem dados</td></tr>';
      } else {
        attRows.forEach(row => {
          const conv = row.total > 0 ? ((row.sales / row.total) * 100).toFixed(0) : '0';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${escapeHTML(row.name)}</strong></td>
            <td>${row.sales}</td>
            <td>${formatCurrency(row.revenue)}</td>
            <td>${conv}%</td>
          `;
          attTableBody.appendChild(tr);
        });
      }
    }

    const recentTableBody = document.getElementById('empDashboardRecentClientsTableBody');
    if (recentTableBody) {
      recentTableBody.innerHTML = '';
      const sorted = [...periodClients].sort((a, b) => {
        return new Date(b.date + 'T12:00:00') - new Date(a.date + 'T12:00:00');
      }).slice(0, 5);

      if (sorted.length === 0) {
        recentTableBody.innerHTML = '<tr><td colspan="6" class="table-empty">Nenhum cliente cadastrado</td></tr>';
      } else {
        sorted.forEach(c => {
          const prod = state.products.find(p => String(p.id) === String(c.productId));
          const prodName = prod ? prod.name : 'Produto Desconhecido';
          
          let statusBadge = 'badge-neutral';
          if (c.status === 'Pago') statusBadge = 'badge-success';
          else if (c.status === 'Golpe') statusBadge = 'badge-danger';
          else if (c.status === 'Pagamento pendente') statusBadge = 'badge-warning';

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><strong>${escapeHTML(c.name)}</strong></td>
            <td>${escapeHTML(prodName)}</td>
            <td>${formatCurrency(c.saleValue)}</td>
            <td>${escapeHTML(c.attendant)}</td>
            <td><span class="badge ${statusBadge}">${escapeHTML(c.status)}</span></td>
            <td>${formatDateDisplay(c.date)}</td>
          `;
          recentTableBody.appendChild(tr);
        });
      }
    }
  }

  // ==========================================================================
  // APP INGESTION STARTUP
  // ==========================================================================
  async function initApp() {
    const isLoggedIn = await checkSession();
    if (!isLoggedIn) {
      showLoginScreen();
    } else {
      await loadMainSystemData();
    }

    // Window resize observer to update chart width smoothly
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (state.currentView === 'dashboard') {
          updateDashboard();
        }
      }, 200);
    });
  }

  // Trigger app initialization
  initApp();
});
