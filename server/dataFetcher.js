const yahooFinance = require('yahoo-finance2').default;
const { formatIndex, formatCountryIndices } = require('./utils');

async function fetchDashboardData() {
  const [
    nifty50, sensex, niftyBank, niftyIT, midcap50,
    next50, midcap100, indiaVix, finServices,
  ] = await Promise.all([
    yahooFinance.quote("^NSEI"),
    yahooFinance.quote("^BSESN"),
    yahooFinance.quote("^NSEBANK"),
    yahooFinance.quote("^CNXIT"),
    yahooFinance.quote("^NSEMDCP50"),
    yahooFinance.quote("^NSMIDCP"),
    yahooFinance.quote("^CRSMID"),
    yahooFinance.quote("^INDIAVIX"),
    yahooFinance.quote("NIFTY_FIN_SERVICE.NS"),
  ]);

  return {
    indices: {
      nifty50: formatIndex("NIFTY 50", nifty50),
      sensex: formatIndex("SENSEX", sensex),
      niftyBank: formatIndex("NIFTY BANK", niftyBank),
      niftyIT: formatIndex("NIFTY IT", niftyIT),
      niftyMidcap50: formatIndex("NIFTY MIDCAP 50", midcap50),
      niftyNext50: formatIndex("NIFTY NEXT 50", next50),
      niftyMidcap100: formatIndex("NIFTY MIDCAP 100", midcap100),
      indiaVix: formatIndex("INDIA VIX", indiaVix),
      niftyFinancialServices: formatIndex("NIFTY FINANCIAL SERVICES", finServices),
    },
    gainers: ['Reliance', 'HDFC Bank', 'Infosys'],
    losers: ['TCS', 'Wipro', 'ICICI Bank'],
  };
}

async function fetchCountryIndices() {
  const [india, us, china, singapore, uk, southKorea] = await Promise.all([
    Promise.all([
      yahooFinance.quote("^NSEI"),
      yahooFinance.quote("^BSESN"),
      yahooFinance.quote("^NSEBANK"),
      yahooFinance.quote("^CNXIT"),
    ]),
    Promise.all([
      yahooFinance.quote("^GSPC"),
      yahooFinance.quote("^DJI"),
      yahooFinance.quote("^IXIC"),
      yahooFinance.quote("^RUT"),
    ]),
    Promise.all([
      yahooFinance.quote("000001.SS"),
      yahooFinance.quote("399001.SZ"),
      yahooFinance.quote("399006.SZ"),
    ]),
    Promise.all([
      yahooFinance.quote("^STI"),
      yahooFinance.quote("WISGP.SI"),
    ]),
    Promise.all([
      yahooFinance.quote("^FTSE"),
      yahooFinance.quote("^FTMC"),
    ]),
    Promise.all([
      yahooFinance.quote("^KS11"),
      yahooFinance.quote("^KQ11"),
    ]),
  ]);

  return {
    india: formatCountryIndices(india),
    us: formatCountryIndices(us),
    china: formatCountryIndices(china),
    singapore: formatCountryIndices(singapore),
    uk: formatCountryIndices(uk),
    southKorea: formatCountryIndices(southKorea),
  };
}

module.exports = { fetchDashboardData, fetchCountryIndices };
