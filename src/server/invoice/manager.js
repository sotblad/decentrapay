import PouchDB from 'pouchdb'
import { ethers } from 'ethers'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-adapter-node-websql'))

let walletDB, invoiceDB 

if (!walletDB)  {
  walletDB = new PouchDB('wallets.db', {adapter:'websql'})
  invoiceDB = new PouchDB('invoices.db', {adapter:'websql'})
  invoiceDB.createIndex({
    index: {
      fields: ['state']
    }
  })

}

export default class {
  static async createInvoice(form) {
    delete form['apiKey']
    form.currency = form.currency || 'WMUE'
    const props = {...form}
    props.created = Date.now()
    let wallet = ethers.Wallet.createRandom()
    wallet = {address:wallet.address,privateKey:wallet.privateKey}
    let result = await walletDB.post(wallet)
    props.wallet = {
      _id: result.id,
      address: wallet.address,
      key: wallet.privateKey,
      created: Date.now()
    }
    props.state = 'pending'
    result = await invoiceDB.post(props)
    return invoiceDB.get(result.id).then( res => { console.log(res); return res } )
  } 
  static getInvoice(id) {
    return invoiceDB.get(id)
  }
  static findPendingInvoices() {
    return invoiceDB.find({selector:{state:{$in:['pending','confirming']}}}).then( result => result.docs )
  }
  static findPaidInvoices() {
    return invoiceDB.find({selector:{state:'paid'}}).then( result => result.docs )
  }
  static async updateInvoice(id, upd) {
    let doc = await invoiceDB.get(id)
    doc = Object.assign(doc, upd) 
    return invoiceDB.put({_id:id,_rev:doc._rev,...doc})
  }
}
