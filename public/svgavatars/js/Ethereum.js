'use strict';

// var NODE_URL = 'https://test-lb.ether.camp';
// var NODE_URL = 'http://san-nginx.cloudapp.net:8545';
var NODE_URL = 'https://frontier-lb.ether.camp';

var WEI_IN_ETH = new BigNumber('1000000000000000000');
var GAS_MULTIPLIER = 1.5;
var DEFAULT_GAS_LIMIT = 20000;

var EthUtil = window.modules.EthUtil;
var EthTx = window.modules.EthTx;


var rpcCall = function(data) {

  // add annoying jsonrpc: '2.0'
  if (Object.prototype.toString.call(data) === '[object Array]') {
    for (var i = 0; i < data.length; i++) {
      _.extendOwn(data[i], { jsonrpc: '2.0' });  
    }
  } else {
    _.extendOwn(data, { jsonrpc: '2.0' });
  }

  return $.ajax({
    url: NODE_URL,
    type: 'post',
    data: JSON.stringify(data),
    contentType: 'application/json'
  });
}

window.modules.Ethereum = {

    rpcCall: rpcCall,

    weiToEth: function(hexWei) {
      var bnWei = new BigNumber(hexWei, 16);
      return bnWei.div(WEI_IN_ETH).toNumber();
    },

    weiDecimalToEth: function(hexWei) {
      var bnWei = new BigNumber(hexWei);
      return bnWei.div(WEI_IN_ETH).toNumber();
    },

    resToBigNumber: function(res) {
      return !res.result || res.result === '0x' ? new BigNumber(0) : new BigNumber(res.result, 16);
    },

    resToEth: function(res) {
      return !res.result || res.result === '0x' ? 0 : this.weiToEth(res.result);
    },

    getBalance: function(address) {

      var deferred = $.Deferred();
      var self = this;

      self.rpcCall({
        id: 1,
        method: 'eth_getBalance',
        params: [window.modules.EthereumAddress.prefixed(address), "pending"]
      }).then(function(res) {
        deferred.resolve(self.resToEth(res));
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    },

    getNonce: function(address) {
      
      var deferred = $.Deferred();
      var self = this;

      self.rpcCall({
        id: 1,
        method: 'eth_getTransactionCount',
        params: [window.modules.EthereumAddress.prefixed(address), "pending"]
      }).then(function(res) {
        deferred.resolve(self.resToBigNumber(res).toNumber());
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    },

    getNonceAndPrice: function(address, data) {
      var deferred = $.Deferred();
      var self = this;
      
      self.rpcCall([
        
        {
          id: 1,
          method: 'eth_getTransactionCount',
          params: [window.modules.EthereumAddress.prefixed(address), "pending"]
        },

        {
          id: 2,
          method: 'eth_gasPrice',
          params: [window.modules.EthereumAddress.prefixed(address), "pending"]
        },

        {
          id: 3,
          method: 'eth_estimateGas',
          params: [{
            to: window.modules.EthereumAddress.prefixed(address),
            data: data
          }]
        }

      ]).then(function(resp) {
        var stats = {};

        for (var i = 0; i < resp.length; i++) {
          var res = resp[i];
          switch(res.id) {
            case 1: 
              stats.nonce = self.resToBigNumber(res).toNumber();
              break;
            case 2:
              stats.price = self.resToBigNumber(res).toNumber();
              break;
            case 3:
              stats.gas = self.resToBigNumber(res).toNumber();
              break;
          }
        }

        deferred.resolve(stats);
      }, function(error) {
        deferred.reject(error);
      });    

      return deferred.promise;
    },

    sendValue: function(receiver, pKey, value) {
      return this.sendTx(receiver, pKey, value, null, 21000);
    },

    sendData: function(receiver, pKey, data, gasLimit, options) {
      return this.sendTx(receiver, pKey, 0, data, gasLimit, options);
    },

    createContract: function(pKey, data) {
      return this.sendTx(null, pKey, 0, data, 3900000); // gas limit for DST contract creation
    },

    createTx: function(deferred) {

      var hashDeferred = $.Deferred();

      return {
        nonce: 0,
        hash: '',
        status: 'PENDING',
        message: 'Pending',
        promise:  deferred.promise,
        deferred: deferred,
        hashDeferred: hashDeferred,
        hashPromise: hashDeferred.promise
      }
    },

    sendTxAndReceiveHash: function(tx, receiver, data, value, pKey, gasLimit, nonce) {

      var deferred = $.Deferred();

      var self = this;

      // get nonce
      var sender = window.web3 ? window.web3.eth.accounts[0] : window.modules.EthereumAddress.getFromPKey(pKey);
      self.getNonceAndPrice(sender, data)().then(function(info) {

        if (nonce === undefined) {
          nonce = info.nonce;
        }

        if (tx) {
          tx.nonce = nonce;
        }

        // create Tx
        if (!window.web3) {
          var ethTx = new EthTx({
            nonce: nonce,
            gasLimit: gasLimit,
            // gasPrice: Math.round(info.price * GAS_MULTIPLIER),
            gasPrice: 50000000000,
            to: receiver == null ? null : window.modules.EthereumAddress.prefixed(receiver),
            value: value,
            data: data
          });

          ethTx.sign(window.modules.EthUtil.toBuffer(window.modules.EthereumAddress.prefixed(pKey), 'hex'));

          self.rpcCall({
            id: 1,
            method: 'eth_sendRawTransaction',
            params: ['0x' + ethTx.serialize().toString('hex')]
          }).then(function(response) {
            deferred.resolve(response);
          }, function(error) {
            deferred.resolve(error);
          });
        } else {
          // with MetaMask
          window.web3.eth.sendTransaction({
            nonce: nonce,
            gasLimit: gasLimit,
            // gasPrice: Math.round(info.price * GAS_MULTIPLIER),
            gasPrice: 50000000000,
            to: receiver == null ? null : window.modules.EthereumAddress.prefixed(receiver),
            value: value,
            data: data
          }, function(err, result) {
            deferred.resolve({error: err, result: result});
          });
        }

      }, function(error) {
        deferred.resolve(error);
      });

      return deferred.promise;
    },

    sendTx: function(receiver, pKey, value, data, gasLimit, options) {

      if (options === undefined) {
        options = {};
      }

      if (options.statusCallback === undefined) {
        options.statusCallback = successfulTxStatus;
      }

      var deferred = $.Deferred();
      var self = this;

      var tx = self.createTx(deferred);
      self.sendTxAndReceiveHash(tx, receiver, data, value, pKey, gasLimit, options.nonce).then(function(resp) {

        if (!resp.error) {
          // get Tx hash
          tx.hash = resp.result;
          tx.hashDeferred.resolve(tx.hash);
        }

        // get Tx hash
        return resp;

      }).then(function(resp) {

        // reject Tx
        if (resp.error) {
          tx.status   = 'REJECTED';
          tx.message  = resp.error.message;
          tx.deferred.resolve(tx);
          return false;
        }
        
        var sentAt = Date.now();

        // wait for Tx receipt
        var loop = $interval(function() {

          self.rpcCall({
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [tx.hash]
          }).then(function(resp) {

            // reject if more than 20 mins passed since Tx was sent
            if (Date.now() - sentAt > 20 * 60 * 1000) {

              $interval.cancel(loop);

              tx.status   = 'REJECTED';
              tx.message  = 'Rejected by time out';
              tx.deferred.resolve(tx);

              return false;
            }

            if (!resp.error && resp.result != null && resp.result.blockNumber != null) {

              $interval.cancel(loop);

              tx.receipt = resp.result;
              tx.block   = parseInt(tx.receipt.blockNumber, 16);
              options.statusCallback(tx)
              tx.deferred.resolve(tx);

            }

          });

        }, 3000);

      });

      return tx;
    },

    getTransactionReceipt: function(hash) {
      var deferred = $.Deferred();
      var sentAt = Date.now();

      var tx = {}
      // wait for Tx receipt
      var loop = setInterval(function() {

        self.rpcCall({
          id: 1,
          method: 'eth_getTransactionReceipt',
          params: [hash]
        }).then(function(resp) {

          // reject if more than 20 mins passed since Tx was sent
          if (Date.now() - sentAt > 20 * 60 * 1000) {

            clearInterval(loop);

            tx.status   = 'REJECTED';
            tx.message  = 'Rejected by time out';
            tx.deferred.resolve(tx);

            return false;
          }

          if (!resp.error && resp.result != null && resp.result.blockNumber != null) {

            clearInterval(loop);

            tx.receipt = resp.result;
            tx.block   = parseInt(tx.receipt.blockNumber, 16);
            deferred.resolve(tx);

          }

        });

      }, 3000);

      return deferred;
    }    
  }
