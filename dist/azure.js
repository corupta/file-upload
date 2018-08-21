function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const azure = require("azure-storage");
const util = require("./util");

module.exports = options => {
  // {
  //   container: "xxxx",
  //   account: "xxxx",
  //   connectionString: "xxxx",
  // }
  let { container, account, connectionString, targetProtocol, targetHost } = options;
  if (!(account && container && connectionString)) {
    throw new Error("Missing option in options: [container, account, connectionString]");
  }
  if (targetProtocol) {
    targetProtocol = `${targetProtocol}:`;
  } else {
    targetProtocol = "";
  }
  if (!targetHost) {
    targetHost = `${account}.blob.core.chinacloudapi.cn`;
  }

  const blobSvc = azure.createBlobService(connectionString);

  return {
    put: (() => {
      var _ref = _asyncToGenerator(function* (filename, file) {
        yield util.fileResolve(file);
        return new Promise(function (resolve, reject) {
          blobSvc.createBlockBlobFromLocalFile(container, filename, file.path, function (err, result, res) {
            err ? reject(err) : resolve();
          });
        });
      });

      return function put(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })(),
    get: result => {
      Object.keys(result).map(filename => {
        return result[filename] = `${targetProtocol}//${targetHost}/${container}/${result[filename]}`;
      });
      return result;
    }
  };
};