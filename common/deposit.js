const TronWeb = require('tronweb');
const moment = require('moment');
/**
 * Filter transaction data that deposit only BEP20 And ERC20
 * @param {*} cid 
 * @param {*} data 
 * @param {*} address 
 * @param {*} coinList 
 * @param {*} res 
 * @returns 
 */
 const createDepositData = async (cid, data, address, coinList, res) => {
  let trx = [];
  data.map((item) => {
    let record;
    if (item.log_events.length > 0) {
      // console.log(item.log_events,  'here item log events')
      //Filter Internal token transaction log events
      let tokenData = item.log_events.filter((i) => {
        let params = i.decoded.params.filter((element) => {
          // console.log(element.value,'element value')
          // console.log(address,'address')
          return (element.value).toLowerCase() === address.toLowerCase()
        });
        if (params.length > 0) {
          return i
        }
      })
      // console.log(tokenData,'token Data')
      if (tokenData.length > 0) {
        if (coinList.includes(tokenData[0]?.sender_contract_ticker_symbol) === true) {
          record = {
            "network": cid === 56 || cid === 97 ? "BEP20" : cid === 1 ? "ERC20" : 'TRC20',
            "tokenName": tokenData[0]?.sender_contract_ticker_symbol,
            "block_signed_at": tokenData[0]?.block_signed_at,
            "block_height": tokenData[0]?.block_height,
            "tx_hash": tokenData[0]?.tx_hash,
            "successful": true,
            "from_address": tokenData[0]?.sender_contract_ticker_symbol,
            "to_address": address.toLowerCase(),
            "value": tokenData[0].decoded.params[2]?.value / 10 ** tokenData[0]?.sender_contract_decimals,
            "decimal": tokenData[0]?.sender_contract_decimals
          }
        }
      }
    }
    else {
      record = {
        "network": cid === 56 || cid === 97 ? "BEP20" : cid === 1 ? "ERC20" : 'TRC20',
        "tokenName": cid === 56 || cid === 97 ? "BNB" : cid === 1 ? "ETH" : 'TRX',
        "block_signed_at": item?.block_signed_at,
        "block_height": item?.block_height,
        "tx_hash": item?.tx_hash,
        "tx_offset": item?.tx_offset,
        "successful": item?.successful,
        "from_address": item?.from_address,
        "from_address_label": null,
        "to_address": (item?.to_address).toLowerCase(),
        "to_address_label": null,
        "value": item?.value / 10 ** 18,
        "value_quote": item?.value_quote,
        "gas_offered": item?.gas_offered,
        "gas_spent": item?.gas_spent,
        "gas_price": item?.gas_price,
        "fees_paid": item?.fees_paid,
        "gas_quote": item?.gas_quote,
        "gas_quote_rate": item?.gas_quote_rate,
      }
    }
    // console.log(record,'record')
    if (record !== undefined && record.to_address !== undefined && record.to_address === address.toLowerCase()) {
      trx.push(record);
    }
  })
  return trx;
}

const createTRXDepositData=async(data, address)=>{
  
  const fullNode = process.env.TRONURL;
  const solidityNode = process.env.TRONURL;
  const eventServer = process.env.TRONURL;
  const privateKey = process.env.TRONKEY;
  const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

  const addressBase58 = tronWeb.address.toHex(address)
  let trx=[];
  data.map((item) => {
    let record;
    
    if(item.raw_data!=undefined && item.raw_data.contract[0].parameter.value.to_address!=undefined && item.raw_data.contract[0].parameter.value.to_address!=false){
      
      if(item.raw_data.contract[0].parameter.value.to_address === addressBase58){
        record = {
          "network": 'TRC20',
          "tokenName": 'TRX',
          "block_signed_at": moment(item?.block_timestamp),
          "block_height": item?.blockNumber,
          "tx_hash": item?.txID,
          "from_address": tronWeb.address.fromHex(item.raw_data.contract[0].parameter.value.owner_address),
          "to_address": item.raw_data.contract[0].parameter.value.to_address,
          "value": item.raw_data.contract[0].parameter.value.amount / 10**6,
          "successful": true,
        }
        trx.push(record);
      }
    }
  })
  return trx;
}

const createTRC20DepositData=async(data, address, coinList)=>{
  
  let trx=[];
  data.map((item) => {
    let record;
    if (coinList.includes(item?.token_info.symbol) === true && item?.to === address){
      record = {
        "network": 'TRC20',
        "tokenName": item?.token_info.symbol,
        "block_signed_at": moment(item?.block_timestamp),
        "block_height": 0000,
        "tx_hash": item?.transaction_id,
        "from_address": item?.from,
        "to_address": item?.to,
        "value": item?.value / 10**item?.token_info.decimals,
        "successful": true,
      }
      trx.push(record);
    }
  })
  return trx;
}

module.exports = {
  createDepositData,
  createTRXDepositData,
  createTRC20DepositData
}