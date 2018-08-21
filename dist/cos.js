function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const qcloud = require("qcloud_cos_v4");
const util = require("./util");

module.exports = options => {
  // {
  //   bucket: "xxxx",
  //   appId: "xxxx",
  //   secretID: "xxxx",
  //   secretKey: "xxxx",
  //   region: "gz|sh|tj"
  // }
  let { bucket, appId, secretID, secretKey, region, targetHost, targetProtocol } = options;
  if (!(bucket && appId && secretID && secretKey && region)) {
    throw new Error("Missing option in options: [bucket, appId, secretID, secretKey, bucket, region]");
  }
  qcloud.conf.setAppInfo(appId, secretID, secretKey, region);
  const cos = qcloud.cos;

  if (targetProtocol) {
    targetProtocol = `${targetProtocol}:`;
  } else {
    targetProtocol = "";
  }
  if (!targetHost) {
    targetHost = `${bucket}-${appId}.file.myqcloud.com`;
  }

  return {
    put: (() => {
      var _ref = _asyncToGenerator(function* (filename, file) {
        yield util.fileResolve(file);
        return new Promise(function (resolve, reject) {
          cos.upload(file.path, bucket, filename, "", 1, function (ret) {
            if (ret.code == 0) {
              resolve();
            } else {
              reject(`Code: ${ret.code} .Message: ${ret.message}`);
            }
          });
        });
      });

      return function put(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })(),
    getOne: filename => `${targetProtocol}//${targetHost}/${filename}`,
    get: result => {
      Object.keys(result).map(filename => {
        return result[filename] = `${targetProtocol}//${targetHost}/${result[filename]}`;
      });
      return result;
    }
  };
};