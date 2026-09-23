// Token data
let tokens = [];
let selectedFromToken = null;
let selectedToToken = null;
let currentModalTarget = null;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  await loadTokens();
  setupEventListeners();
});

// Load tokens from API
async function loadTokens() {
  try {
    const response = await fetch('https://interview.switcheo.com/prices.json');
    const data = await response.json();

    // API returns { currency, date, price } and may contain duplicate/stale
    // entries for the same currency - keep only the most recent one.
    const latestByCurrency = new Map();
    for (const entry of data) {
      const price = parseFloat(entry.price);
      if (!entry.currency || !(price > 0)) continue;

      const existing = latestByCurrency.get(entry.currency);
      if (!existing || new Date(entry.date) > new Date(existing.date)) {
        latestByCurrency.set(entry.currency, { ...entry, price });
      }
    }

    tokens = Array.from(latestByCurrency.values())
      .map(token => ({
        symbol: token.currency,
        name: token.currency,
        price: token.price,
        icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.currency}.svg`
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    // Set default tokens
    selectedFromToken = tokens.find(t => t.symbol === 'USDC') || tokens[0];
    selectedToToken = tokens.find(t => t.symbol === 'USDT') || tokens[1];

    updateTokenDisplay();
    calculateExchange();
  } catch (error) {
    console.error('Error loading tokens:', error);
    alert('Failed to load tokens. Please refresh the page.');
  }
}

// Setup event listeners
function setupEventListeners() {
  const fromAmountInput = document.getElementById('from-amount');
  const fromTokenBtn = document.getElementById('from-token-btn');
  const toTokenBtn = document.getElementById('to-token-btn');
  const swapBtn = document.getElementById('swap-btn');
  const tokenSearch = document.getElementById('token-search');
  const modal = document.getElementById('token-modal');

  // Amount input - calculate exchange
  fromAmountInput.addEventListener('input', calculateExchange);

  // Token selection buttons
  fromTokenBtn.addEventListener('click', () => openTokenModal('from'));
  toTokenBtn.addEventListener('click', () => openTokenModal('to'));

  // Swap button
  swapBtn.addEventListener('click', swapTokens);

  // Token search
  tokenSearch.addEventListener('input', filterTokens);

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeTokenModal();
  });
}

const FALLBACK_ICON = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23ddd%22/%3E%3C/svg%3E';

// Update token display
function updateTokenDisplay() {
  if (selectedFromToken) {
    const icon = document.getElementById('from-token-icon');
    icon.src = selectedFromToken.icon;
    icon.onerror = () => { icon.onerror = null; icon.src = FALLBACK_ICON; };
    document.getElementById('from-token-name').textContent = selectedFromToken.symbol;
  }

  if (selectedToToken) {
    const icon = document.getElementById('to-token-icon');
    icon.src = selectedToToken.icon;
    icon.onerror = () => { icon.onerror = null; icon.src = FALLBACK_ICON; };
    document.getElementById('to-token-name').textContent = selectedToToken.symbol;
  }
}

// Calculate exchange rate and output amount
function calculateExchange() {
  const fromAmount = parseFloat(document.getElementById('from-amount').value) || 0;
  const fromError = document.getElementById('from-error');
  const exchangeRateSpan = document.getElementById('exchange-rate');

  // Validation
  if (fromAmount < 0) {
    fromError.textContent = 'Amount cannot be negative';
    document.getElementById('to-amount').value = '';
    return;
  }

  if (fromAmount === 0) {
    fromError.textContent = '';
    document.getElementById('to-amount').value = '';
    exchangeRateSpan.textContent = '-';
    return;
  }

  fromError.textContent = '';

  if (selectedFromToken && selectedToToken) {
    // Calculate exchange rate: if from token costs $1 and to token costs $2, rate is 0.5
    const rate = selectedFromToken.price / selectedToToken.price;
    const toAmount = (fromAmount * rate).toFixed(8);
    document.getElementById('to-amount').value = toAmount;
    exchangeRateSpan.textContent = `1 ${selectedFromToken.symbol} ≈ ${rate.toFixed(6)} ${selectedToToken.symbol}`;
  }
}

// Open token modal
function openTokenModal(target) {
  currentModalTarget = target;
  const modal = document.getElementById('token-modal');
  const tokenSearch = document.getElementById('token-search');
  
  modal.classList.add('active');
  tokenSearch.value = '';
  renderTokenList(tokens);
  tokenSearch.focus();
}

// Close token modal
function closeTokenModal() {
  document.getElementById('token-modal').classList.remove('active');
  currentModalTarget = null;
}

// Render token list
function renderTokenList(filteredTokens) {
  const tokenList = document.getElementById('token-list');
  
  if (filteredTokens.length === 0) {
    tokenList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No tokens found</div>';
    return;
  }

  tokenList.innerHTML = filteredTokens.map(token => `
    <div class="token-item" onclick="selectToken('${token.symbol}')">
      <img src="${token.icon}" alt="${token.symbol}" onerror="this.onerror=null;this.src='${FALLBACK_ICON}'" />
      <div class="token-info">
        <div class="name">${token.symbol}</div>
      </div>
      <div class="token-price">\$${token.price.toFixed(4)}</div>
    </div>
  `).join('');
}

// Filter tokens by search
function filterTokens(e) {
  const query = e.target.value.toLowerCase();
  const filtered = tokens.filter(t => 
    t.symbol.toLowerCase().includes(query) || 
    t.name.toLowerCase().includes(query)
  );
  renderTokenList(filtered);
}

// Select token from modal
function selectToken(symbol) {
  const token = tokens.find(t => t.symbol === symbol);
  
  if (currentModalTarget === 'from') {
    selectedFromToken = token;
  } else {
    selectedToToken = token;
  }

  updateTokenDisplay();
  calculateExchange();
  closeTokenModal();
}

// Swap tokens
function swapTokens() {
  [selectedFromToken, selectedToToken] = [selectedToToken, selectedFromToken];
  updateTokenDisplay();
  calculateExchange();
}

// Handle form submission
async function handleSwap(e) {
  e.preventDefault();

  const fromAmount = parseFloat(document.getElementById('from-amount').value);
  const submitBtn = document.getElementById('submit-btn');
  const fromError = document.getElementById('from-error');

  // Validation
  if (fromAmount <= 0) {
    fromError.textContent = 'Please enter an amount greater than 0';
    return;
  }

  if (!selectedFromToken || !selectedToToken) {
    alert('Please select both tokens');
    return;
  }

  fromError.textContent = '';

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const toAmount = parseFloat(document.getElementById('to-amount').value);
    alert(`Swap successful!\n\nSwapped ${fromAmount} ${selectedFromToken.symbol} for ${toAmount} ${selectedToToken.symbol}`);

    // Reset form
    document.getElementById('from-amount').value = '1';
    calculateExchange();
  } catch (error) {
    alert('Swap failed. Please try again.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Handle input icon loading error
function handleImageError(img) {
  img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22%3E%3Crect fill=%22%23ddd%22 width=%2224%22 height=%2224%22 rx=%2212%22/%3E%3C/svg%3E';
}