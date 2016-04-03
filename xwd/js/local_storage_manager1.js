window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function localStorageManager( name ) {
  var supported = localStorageSupported();
  return supported ? window.localStorage : window.fakeStorage;
}

function localStorageSupported() {
  var testKey = "testKey";
  var testVal = "testVal";
  var storage = window.localStorage;
  try {
    storage.setItem( testKey , testVal );
    var correct = ( storage.getItem( testKey ) != testVal );
    storage.removeItem( testKey );
    return correct;
  } catch ( error ) {
    return false;
  }
};
