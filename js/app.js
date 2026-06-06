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

  // State Management
  const state = {
    currentView: 'dashboard',
    products: [],
    clients: [],
    expenses: [],
    settings: {
      theme: 'system',
      systemName: 'Help Vitall'
    },
    // Temp variables for edits
    editingProductId: null,
    editingClientId: null,
    editingExpenseId: null
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
    clientAttendant: document.getElementById('clientAttendant'),
    clientDate: document.getElementById('clientDate'),
    clientStatus: document.getElementById('clientStatus'),
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
    btnResetDatabase: document.getElementById('btnResetDatabase'),
    themeOptLight: document.getElementById('themeOptLight'),
    themeOptDark: document.getElementById('themeOptDark'),
    themeOptSystem: document.getElementById('themeOptSystem'),

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
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Helper: Format date string to display (DD/MM/YYYY)
  function formatDateDisplay(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
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
    state.currentView = viewId;
    
    // Toggle active classes on sidebar
    elements.sidebarItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
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
      'clients': 'Gestão de Clientes',
      'products': 'Gestão de Produtos',
      'expenses': 'Gestão de Despesas',
      'reports': 'Desempenho por Produto',
      'settings': 'Configurações do Sistema'
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

    // Update UI elements
    elements.sidebarSystemName.textContent = state.settings.systemName;
    elements.settingsSystemName.value = state.settings.systemName;

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
    const systemName = elements.settingsSystemName.value.trim();
    if (!systemName) {
      showToast('Por favor, informe o nome do sistema.', 'error');
      return;
    }

    state.settings.systemName = systemName;
    elements.sidebarSystemName.textContent = systemName;
    await window.db.setSetting('systemName', systemName);

    showToast('Configurações salvas com sucesso!');
  });

  elements.btnResetDatabase.addEventListener('click', async () => {
    if (confirm('Tem certeza absoluta de que deseja limpar todo o banco de dados? Isso excluirá permanentemente todos os clientes, produtos, despesas e configurações.')) {
      try {
        const dbs = ['products', 'clients', 'expenses', 'settings'];
        for (const store of dbs) {
          const transaction = window.db.db.transaction(store, 'readwrite');
          const objectStore = transaction.objectStore(store);
          objectStore.clear();
        }
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
    // Fetch fresh local DB datasets
    try {
      state.products = await window.db.getAll('products');
      state.clients = await window.db.getAll('clients');
      state.expenses = await window.db.getAll('expenses');
    } catch (err) {
      console.error("Error fetching data from database:", err);
      showToast("Falha ao sincronizar dados com o banco local.", "error");
    }

    switch (viewId) {
      case 'dashboard':
        populateDashboardFilters();
        updateDashboard();
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
        renderExpensesList();
        break;
      case 'reports':
        updateReportsView();
        break;
      case 'settings':
        // Handled in loadSettings
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
      const regDate = parseLocalDate(client.date);
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

      // Clients registered on this day
      const dayClients = filteredClients.filter(c => c.date === dateStr);
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
        const regDate = parseLocalDate(c.date);
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

      // Gastos relacionados = linked expenses + (unit cost * paid clients count)
      const directExpenses = prodExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
      const costOfGoodsSold = countPago * (Number(prod.cost) || 0);
      const gastosRelacionados = directExpenses + costOfGoodsSold;

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
        const regDate = parseLocalDate(c.date);
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

      const directExpenses = prodExpenses.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
      const costOfGoodsSold = countPago * (Number(prod.cost) || 0);
      const gastosRelacionados = directExpenses + costOfGoodsSold;

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

    // Filter list
    const filtered = state.clients.filter(client => {
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
            <button class="btn btn-secondary btn-sm btn-icon-only btn-edit-client" data-id="${client.id}" title="Editar">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-danger btn-sm btn-icon-only btn-delete-client" data-id="${client.id}" title="Excluir">
              <svg style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
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
        elements.clientDate.value = client.date;
        elements.clientStatus.value = client.status;
      }
    } else {
      state.editingClientId = null;
      elements.clientId.value = '';
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
      attendant: elements.clientAttendant.value,
      date: elements.clientDate.value,
      status: elements.clientStatus.value
    };

    if (!clientData.name || !clientData.phone || !clientData.country || !clientData.productId || !clientData.planName || !clientData.date) {
      showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
      return;
    }

    try {
      if (state.editingClientId) {
        clientData.id = state.editingClientId;
        await window.db.put('clients', clientData);
        showToast('Cliente editado com sucesso!');
      } else {
        await window.db.add('clients', clientData);
        showToast('Cliente cadastrado com sucesso!');
      }
      closeClientModal();
      loadViewData('clients');
    } catch (err) {
      showToast('Erro ao salvar cliente no banco.', 'error');
      console.error(err);
    }
  });

  async function deleteClient(id) {
    if (confirm('Tem certeza de que deseja excluir este cliente?')) {
      try {
        await window.db.delete('clients', id);
        showToast('Cliente removido.');
        loadViewData('clients');
      } catch (err) {
        showToast('Erro ao excluir cliente.', 'error');
      }
    }
  }

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
  function renderExpensesList() {
    const tableBody = elements.expensesTableBody;
    tableBody.innerHTML = '';

    const searchQuery = elements.searchExpensesInput.value.toLowerCase().trim();

    // Filter list
    const filtered = state.expenses.filter(exp => {
      const matchesSearch = !searchQuery ||
        exp.name.toLowerCase().includes(searchQuery) ||
        exp.category.toLowerCase().includes(searchQuery) ||
        (exp.observation && exp.observation.toLowerCase().includes(searchQuery));
      return matchesSearch;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="table-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>Nenhuma despesa cadastrada</td></tr>`;
      return;
    }

    filtered.forEach(exp => {
      let prodName = 'Nenhum';
      if (exp.productId) {
        const prod = state.products.find(p => String(p.id) === String(exp.productId));
        if (prod) prodName = prod.name;
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${escapeHTML(exp.name)}</strong></td>
        <td><span class="badge badge-neutral">${escapeHTML(exp.category)}</span></td>
        <td><strong class="text-danger">${formatCurrency(exp.value)}</strong></td>
        <td>${formatDateDisplay(exp.date)}</td>
        <td>${escapeHTML(prodName)}</td>
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

  // Expense search listener
  elements.searchExpensesInput.addEventListener('input', renderExpensesList);

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

    const expenseData = {
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
  // APP INGESTION STARTUP
  // ==========================================================================
  async function initApp() {
    // 1. Load configurations
    await loadSettings();

    // 2. Fetch all collections from local DB
    state.products = await window.db.getAll('products');
    state.clients = await window.db.getAll('clients');
    state.expenses = await window.db.getAll('expenses');

    // 3. Render the default Dashboard view
    navigateTo('dashboard');

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
