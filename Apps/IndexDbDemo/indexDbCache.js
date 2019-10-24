/* eslint-disable */
/**
 * Indexed Db操作帮助类
 */
var IndexedDbCache = /** @class */ (function() {
    /**
     * Indexed Db 操作帮助类 构造函数
     * @param dbName 数据库名称
     * @param dbVersion 数据库版本
     * @param storeName 默认存储表名
     */
    function IndexedDbCache(dbName, dbVersion, storeName, processKey) {
        if (dbName === void 0) {
            dbName = 'INDEXEDDB_CACHE';
        }
        if (dbVersion === void 0) {
            dbVersion = 1;
        }
        if (storeName === void 0) {
            storeName = 'ROOT';
        }
        if (processKey === void 0 || typeof processKey !== 'function') {
            processKey = function(key) {
                return key;
            };
        }
        this.db = null;
        this.dbName = dbName;
        this.dbVersion = dbVersion;
        this.storeName = storeName;
        this.processKey = processKey;
    }
    /**
     * 初始化数据库
     */
    IndexedDbCache.prototype.initDb = function() {
        var _this = this;
        var self = this;
        return new Promise(function(resole, reject) {
            var self = _this;
            var dbOpenReq = indexedDB.open(_this.dbName, _this.dbVersion);
            dbOpenReq.onerror = function(evt) {
                reject(this.error);
            };
            dbOpenReq.onsuccess = function(evt) {
                if (!self.db) {
                    self.db = this.result;
                }
                resole(self.db);
            };
            dbOpenReq.onupgradeneeded = function(evt) {
                self.db = this.result;
                if (!self.db.objectStoreNames.contains(self.storeName)) {
                    //需要创建新的Store表
                    var store = self.db.createObjectStore(self.storeName, {
                        keyPath: 'id'
                    });
                    //创建索引
                    store.createIndex('INDEX_ID', 'id', { unique: true });
                }
            };
        });
    };
    /**
     * 根据ID获取车站的数据
     * @param key 车站/区段ID
     */
    IndexedDbCache.prototype.getData = function(key) {
        var self = this;
        key = this.processKey(key);
        return new Promise(function(resole, reject) {
            if (!self.db) {
                reject('数据库' + self.dbName + '不存在');
                return;
            }
            var tran = self.db.transaction(self.storeName, 'readonly');
            var store = tran.objectStore(self.storeName);
            var dataReq = store.get(key);
            dataReq.onerror = function() {
                reject(this.error);
            };
            dataReq.onsuccess = function() {
                resole(this.result);
            };
        });
    };
    /**
     * 添加数据
     * @param data 添加的数据
     */
    IndexedDbCache.prototype.addData = function(data) {
        var self = this;
        data.id = this.processKey(data.id);
        return new Promise(function(resole, reject) {
            if (!self.db) {
                reject('数据库' + self.dbName + '不存在');
                return;
            }
            var tran = self.db.transaction(self.storeName, 'readwrite');
            var store = tran.objectStore(self.storeName);
            var storeAddReq = store.add(data);
            storeAddReq.onerror = function() {
                this.error.data = data;
                reject(this.error);
            };
            storeAddReq.onsuccess = function() {
                resole(this.result);
            };
        });
    };
    /**
     * 根据ID更新数据
     * @param key id
     * @param data 数据
     */
    IndexedDbCache.prototype.updateData = function(key, data) {
        var self = this;
        key = this.processKey(key);
        data.id = key;
        return new Promise(function(resole, reject) {
            if (!self.db) {
                reject('数据库' + self.dbName + '不存在');
                return;
            }
            var tran = self.db.transaction(self.storeName, 'readwrite');
            var store = tran.objectStore(self.storeName);
            var dataReq = store.get(key);
            dataReq.onerror = function() {
                reject({ error: this.error, message: '数据获取失败' });
            };
            dataReq.onsuccess = function() {
                var r = this.result;
                if (!r) r = {};
                Object.assign(r, data);
                var putReq = store.put(r);
                putReq.onerror = function() {
                    reject({ error: this.error, message: '数据更新失败' });
                };
                putReq.onsuccess = function() {
                    resole(this.result);
                };
            };
        });
    };
    /**
     * 删除数据
     * @param key id
     */
    IndexedDbCache.prototype.deleteData = function(key) {
        var self = this;
        return new Promise(function(resole, reject) {
            if (!self.db) {
                reject('数据库' + self.dbName + '不存在');
                return;
            }
            var tran = self.db.transaction(self.storeName, 'readwrite');
            var store = tran.objectStore(self.storeName);
            var dataReq = store.delete(key);
            dataReq.onerror = function() {
                reject(this.error);
            };
            dataReq.onsuccess = function() {
                resole(this.result);
            };
        });
    };
    return IndexedDbCache;
})();
export default IndexedDbCache;
// /**
//  * Trusted Promise constructor.  A Promise created from this constructor is
//  * a trusted when.js promise.  Any other duck-typed promise is considered
//  * untrusted.
//  * @constructor
//  * @name Promise
//  */
// function Promise(then) {
//   this.then = then;
// }

// Promise.prototype = {
//   /**
//    * Register a callback that will be called when a promise is
//    * fulfilled or rejected.  Optionally also register a progress handler.
//    * Shortcut for .then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress)
//    * @param {function?} [onFulfilledOrRejected]
//    * @param {function?} [onProgress]
//    * @returns {Promise}
//    */
//   always: function(onFulfilledOrRejected, onProgress) {
//     return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
//   },

//   /**
//    * Register a rejection handler.  Shortcut for .then(undefined, onRejected)
//    * @param {function?} onRejected
//    * @returns {Promise}
//    */
//   otherwise: function(onRejected) {
//     return this.then(undef, onRejected);
//   },

//   /**
//    * Shortcut for .then(function() { return value; })
//    * @param  {*} value
//    * @returns {Promise} a promise that:
//    *  - is fulfilled if value is not a promise, or
//    *  - if value is a promise, will fulfill with its value, or reject
//    *    with its reason.
//    */
//   yield: function(value) {
//     return this.then(function() {
//       return value;
//     });
//   },

//   /**
//    * Assumes that this promise will fulfill with an array, and arranges
//    * for the onFulfilled to be called with the array as its argument list
//    * i.e. onFulfilled.spread(undefined, array).
//    * @param {function} onFulfilled function to receive spread arguments
//    * @returns {Promise}
//    */
//   spread: function(onFulfilled) {
//     return this.then(function(array) {
//       // array may contain promises, so resolve its contents.
//       return all(array, function(array) {
//         return onFulfilled.apply(undef, array);
//       });
//     });
//   }
// };
