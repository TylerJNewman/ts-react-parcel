const formatConfig = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  currencyDisplay: 'symbol',
};

const numberFormat = new Intl.NumberFormat('en-US', formatConfig);

const roundCurrency = numberFormat.format;

export default roundCurrency;
