function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const ObsClient = require("obs-sdk");
const util = require("./util");

module.exports = options => {
  // {
  //   bucket: "xxxx",
  //   accessKeyId: "xxxx",
  //   accessKeySecret: "xxxx",
  //   server: "xxxx",
  // }
  let { bucket, accessKeyId, accessKeySecret, server, targetHost, targetProtocol } = options;
  if (!(bucket && accessKeyId && accessKeySecret && server)) {
    throw new Error("Missing option in options: [bucket, accessKeyId, accessKeySecret, server]");
  }
  const obs = new ObsClient();
  obs.Factory(accessKeyId, accessKeySecret, true, server, true, true);
  obs.InitLog("error");

  if (targetProtocol) {
    targetProtocol = `${targetProtocol}:`;
  } else {
    targetProtocol = "";
  }
  if (!targetHost) {
    targetHost = server;
  }

  return {
    put: (() => {
      var _ref = _asyncToGenerator(function* (filename, file) {
        yield util.fileResolve(file);
        return new Promise(function (resolve, reject) {
          obs.PutObject({
            "Bucket": bucket,
            "Key": filename,
            "ACL": "public-read-write",
            "SourceFile": file.path
          }, function (err, result) {
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
        return result[filename] = `${targetProtocol}//${targetHost}/${bucket}/${result[filename]}`;
      });
      return result;
    }
  };
};