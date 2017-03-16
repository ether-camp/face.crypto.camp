'use strict';

var EthUtil = window.modules.EthUtil;

var jobsCnt = 0;

var getPKeyIter = function(pKey, iterations) {

var deferred = $.Deferred();

setTimeout(function() {
  for (var i = 0; i < iterations; i++) {
    var binary = EthUtil.sha3(pKey.value);
    pKey.value = EthUtil.bufferToHex(binary)
  }
  deferred.resolve();
}, 0);

return deferred.promise;
}

window.modules.EthereumAddress = {

prefixed: function(address) {
  return address.startsWith('0x') ? address : '0x' + address;
},

notPrefixed: function(address) {
  return address.startsWith('0x') ? address.substring(2, address.length) : address;
},

isValid: function(value) {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(value);
},

generatePKey: function(seed) {

  var deferred = $.deferred();

  // return if seed is a PK itself
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(seed)) {
    deferred.resolve(this.prefixed(seed));
    return deferred.promise;
  }

  var pKey = { value: seed }
  var jobId = ++jobsCnt;

  // otherwise do sha3 N times

  getPKeyIter(pKey)
    .then(function() {
      if (jobId != jobsCnt) return false;
      return getPKeyIter(pKey, 1000);
    })
    .then(function() {
      if (jobId != jobsCnt) return false;
      return getPKeyIter(pKey, 1031);
    })
    .then(function(ret) {

      if (ret == false) {
        deferred.reject();
        return undefined;
      }

      deferred.resolve(pKey.value);
    });

  return deferred.promise;
},

getFromPKey: function(pKey) {
  // sanity check
  if (pKey.length != 66) return undefined;
  return EthUtil.bufferToHex(EthUtil.privateToAddress(pKey));
}

}
