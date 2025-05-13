function formatIndex(name, data) {
  return {
    name,
    price: data?.regularMarketPrice ?? 0,
    change: data?.regularMarketChange ?? 0,
    changePercent: data?.regularMarketChangePercent?.toFixed(2) ?? '0',
  };
}

function formatCountryIndices(indices) {
  return indices.map(data => ({
    name: data?.displayName || data?.shortName || 'N/A',
    price: data?.regularMarketPrice ?? 0,
    change: data?.regularMarketChange ?? 0,
    changePercent: data?.regularMarketChangePercent?.toFixed(2) ?? '0',
    currency: data?.currency ?? 'INR',
  }));
}

module.exports = { formatIndex, formatCountryIndices };
