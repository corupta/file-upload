function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const oss = require("ali-oss").Wrapper;
const util = require("./util");

module.exports = options => {
  // {
  //    accessKeyId:     "keyId",
  //    accessKeySecret: "secret",
  //    bucket:          "terminus-designer",
  //    region:          "oss-cn-hangzhou"
  // }
  let { accessKeyId, accessKeySecret, bucket, region, targetProtocol, attachment, targetHost } = options;

  if (!targetHost) {
    targetHost = `${bucket}.${region}.aliyuncs.com`;
  }

  if (!(accessKeyId && accessKeySecret && bucket && region)) {
    throw new Error("Missing option in options: [accessKeyId, accessKeySecret, bucket, region]");
  }
  const store = new oss(options);

  return {
    put: (() => {
      var _ref = _asyncToGenerator(function* (filename, file) {
        yield util.fileResolve(file);
        const opts = attachment === true ? {
          headers: {
            "Content-Disposition": `attachment;filename=${encodeURIComponent(file.filename)};filename*=UTF-8''${encodeURIComponent(file.filename)}`
          }
        } : undefined;
        return store.put(filename, file.path, opts);
      });

      return function put(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })(),
    get: result => {
      Object.keys(result).map(filename => {
        return result[filename] = `${targetProtocol ? `${targetProtocol}:` : ""}//${targetHost}/${result[filename]}`;
      });
      return result;
    }
  };
};