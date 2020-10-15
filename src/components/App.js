import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3'
import Navbar from './Navbar'
import Receipt from '../abis/Receipt.json'
import Main from './Main'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Receipt.networks[networkId];
    if(networkData) {
    const receipt = web3.eth.Contract(Receipt.abi, networkData.address);
    console.log(receipt);
    this.setState({ receipt });
    const receiptCount = await receipt.methods.receiptCount().call()
    this.setState({ receiptCount })
    for (var i = 1; i <= receiptCount; i++) {
      const p = await receipt.methods.receipt(i).call()
      this.setState({
        receipts: [...this.state.receipts, p]
      })
    }
    console.log(receiptCount.toString())
    this.setState({ loading: false})
    } else {
    window.alert('Marketplace contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.addReceipt = this.addReceipt.bind(this)
    this.state = {
      account: '',
      receiptCount: 0,
      receipts: [],
      loading: false
    }
  }

  addReceipt(date,time,medicine,disease,patientid) {
    this.setState({ loading: false })
    this.state.receipt.methods.addReceipt(date,time,medicine,disease,patientid).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
          <main role="main" className="col-lg-12 d-flex">
            { this.state.loading
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
              : <Main 
              addReceipt={this.addReceipt}
              receipts={this.state.receipts}/>
            }
          </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
