(function () {
  'use strict';

  // The shared F controller binds these hidden controls before this script runs.
  // It remains the sole owner of amount persistence and the application URL.
  const amount = document.getElementById('amount');
  const apply = document.getElementById('apply');
  const continueButton = document.getElementById('amount-continue');
  const bandOptions = Array.from(document.querySelectorAll('.amount-option[data-amount]'));
  if (!amount || !apply || !continueButton || bandOptions.length !== 4) return;

  const amountValue = document.getElementById('amount-value');
  const paymentValue = document.getElementById('payment');
  const rateValue = document.getElementById('rate');
  const interestValue = document.getElementById('interest');
  const totalValue = document.getElementById('total');
  const purposeValue = document.getElementById('purpose-value');
  const bandLabel = document.getElementById('f-band-label');
  const terms = Array.from(document.querySelectorAll('.terms button[data-term]'));
  const purposes = Array.from(document.querySelectorAll('.purposes button'));

  // Illustrative inputs match the Optical Blue calculator; F's application
  // still receives exactly one of its original four amount bands.
  const annualRates = {
    24: 0.035, 36: 0.03, 60: 0.025, 84: 0.02, 120: 0.015,
    144: 0.015, 180: 0.015, 240: 0.015, 300: 0.015, 360: 0.015
  };
  const representativeAmounts = {
    '10萬-20萬': 100000,
    '20萬-30萬': 250000,
    '30萬-50萬': 400000,
    '50萬-100萬': 750000
  };
  const startingTerm = terms.find(function (button) { return button.classList.contains('selected'); });
  let term = startingTerm && annualRates[Number(startingTerm.dataset.term)]
    ? Number(startingTerm.dataset.term)
    : 60;

  function formatMoney(value) {
    return 'NT$ ' + Math.max(0, Math.round(value)).toLocaleString('zh-TW');
  }

  function amountBand(principal) {
    if (principal <= 200000) return '10萬-20萬';
    if (principal <= 300000) return '20萬-30萬';
    if (principal <= 500000) return '30萬-50萬';
    return '50萬-100萬';
  }

  function isSelectedBand(button) {
    return button.getAttribute('aria-pressed') === 'true';
  }

  function renderCalculator() {
    const principal = Number(amount.value);
    const annualRate = annualRates[term];
    const monthlyRate = annualRate / 12;
    const monthlyPayment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term));
    const totalPayment = monthlyPayment * term;

    amountValue.textContent = formatMoney(principal);
    paymentValue.textContent = formatMoney(monthlyPayment);
    rateValue.textContent = (annualRate * 100).toFixed(1) + '%';
    interestValue.textContent = formatMoney(totalPayment - principal);
    totalValue.textContent = formatMoney(totalPayment);
    amount.setAttribute('aria-valuetext', formatMoney(principal));
    amount.style.setProperty('--fill', ((principal - Number(amount.min)) / (Number(amount.max) - Number(amount.min))) * 100 + '%');

    const band = amountBand(principal);
    const option = bandOptions.find(function (button) { return button.dataset.amount === band; });
    if (option && !isSelectedBand(option)) option.click();
    if (bandLabel) bandLabel.textContent = band;
    apply.disabled = continueButton.disabled;

    terms.forEach(function (button) {
      const selected = Number(button.dataset.term) === term;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  const restored = bandOptions.find(isSelectedBand);
  if (restored && representativeAmounts[restored.dataset.amount]) {
    amount.value = String(representativeAmounts[restored.dataset.amount]);
  }
  amount.addEventListener('input', renderCalculator);
  terms.forEach(function (button) {
    button.addEventListener('click', function () {
      const nextTerm = Number(button.dataset.term);
      if (!annualRates[nextTerm]) return;
      term = nextTerm;
      renderCalculator();
    });
  });

  purposes.forEach(function (button) {
    button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
    button.addEventListener('click', function () {
      purposes.forEach(function (option) {
        option.classList.toggle('selected', option === button);
        option.setAttribute('aria-pressed', String(option === button));
      });
      if (purposeValue) purposeValue.textContent = button.textContent.trim();
      const disclosure = button.closest('details');
      if (disclosure) disclosure.open = false;
    });
  });

  apply.addEventListener('click', function (event) {
    event.preventDefault();
    renderCalculator();
    continueButton.click();
  });

  renderCalculator();
})();
