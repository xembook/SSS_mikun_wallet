const symbol = require('/node_modules/symbol-sdk')

const GENERATION_HASH = '57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6'
const EPOCH = 1615853185
const XYM_ID = '6BED913FA20223F8'
const NODE_URL = 'https://symbol-mikun.net:3001'
const NET_TYPE = symbol.NetworkType.MAIN_NET

const repositoryFactory = new symbol.RepositoryFactoryHttp(NODE_URL)
const accountHttp = repositoryFactory.createAccountRepository()
const transactionHttp = repositoryFactory.createTransactionRepository()

setTimeout(() => {
  
const address = symbol.Address.createFromRawAddress(window.SSS.activeAddress)

const dom_addr = document.getElementById('wallet-addr')
dom_addr.innerText = address.pretty()

accountHttp.getAccountInfo(address)
  .toPromise()
  .then((accountInfo) => {
    for (let m of accountInfo.mosaics) {
      if (m.id.id.toHex() === XYM_ID) {
        const dom_xym = document.getElementById('wallet-xym')
        dom_xym.innerText = `XYM Balance : ${m.amount.compact() / Math.pow(10, 6)}`
      }
    }
  })
const searchCriteria = {
  group: symbol.TransactionGroup.Confirmed,
  address,
  pageNumber: 1,
  pageSize: 10,
  order: symbol.Order.Desc,
}

transactionHttp
  .search(searchCriteria)
  .toPromise()
  .then((txs) => {
    console.log(txs)
    const dom_txInfo = document.getElementById('wallet-transactions')
    for (let tx of txs.data) {
      console.log(tx)
      const dom_tx = document.createElement('div')
      const dom_txType = document.createElement('div')
      const dom_hash = document.createElement('div')

      dom_txType.innerText = `Transaction Type : ${getTransactionType(tx.type)}`
      dom_hash.innerText = `Transaction Hash : ${tx.transactionInfo.hash}`

      dom_tx.appendChild(dom_txType)
      dom_tx.appendChild(dom_hash)
      dom_tx.appendChild(document.createElement('hr'))

      dom_txInfo.appendChild(dom_tx)
    }
  })
}, 500)


function getTransactionType (type) { // https://symbol.github.io/symbol-sdk-typescript-javascript/1.0.3/enums/TransactionType.html
  if (type === 16724) return 'TRANSFER TRANSACTION'
  return 'OTHER TRANSACTION'
}

function handleSSS() {
  console.log('handle sss')
  const addr = document.getElementById('form-addr').value
  const amount = document.getElementById('form-amount').value
  const message = document.getElementById('form-message').value
  
  const tx = symbol.TransferTransaction.create(
    symbol.Deadline.create(EPOCH),
    symbol.Address.createFromRawAddress(addr),
    [
      new symbol.Mosaic(
        new symbol.MosaicId(XYM_ID),
        symbol.UInt64.fromUint(Number(amount)*1000000)
      )
    ],
    symbol.PlainMessage.create(message),
    NET_TYPE,
    symbol.UInt64.fromUint(2000000)
  )

  window.SSS.setTransaction(tx)

  window.SSS.requestSign().then(signedTx => {
    console.log('signedTx', signedTx)
    transactionHttp.announce(signedTx)
  })
}
