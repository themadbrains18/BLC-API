const smtp_host = 'smtp.gmail.com';
const smtp_port = '587';
const smtp_user = 'primeexperiaexchange@gmail.com'
const smtp_password = 'fzelrkeucpzevhqy'
const SMTP_SECURE = false
const APIURL='http://localhost:5000/api';
const MarketCapAPIURL="https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=50&page=1&sparkline=false";
const web3Provider= "https://data-seed-prebsc-1-s1.binance.org:8545/"; //"https://bsc-dataseed.binance.org/"; //"https://data-seed-prebsc-1-s1.binance.org:8545/"

module.exports={
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_password,
  SMTP_SECURE,
  APIURL,
  MarketCapAPIURL,
  web3Provider
}

