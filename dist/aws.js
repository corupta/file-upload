function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const AWS = require('aws-sdk');
const util = require("./util");
const fs = require('fs');
module.exports = options => {
  let { bucket, accessKeyId, secretAccessKey, endpoint = 'https://s3.amazonaws.com', s3ForcePathStyle, signatureVersion } = options;
  if (!(bucket && accessKeyId && secretAccessKey)) {
    throw new Error("Missing option in options: [bucket , accessKeyId , secretAccessKey]");
  }

  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    endpoint,
    s3ForcePathStyle,
    signatureVersion
  });

  return {
    put: (() => {
      var _ref = _asyncToGenerator(function* (filename, file) {
        yield util.fileResolve(file);
        return new Promise(function (resolve, reject) {
          const params = { Bucket: bucket, Key: filename, Body: fs.createReadStream(file.path) };
          s3.putObject(params, function (err, data) {
            if (err) reject(err);else resolve();
          });
        });
      });

      return function put(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    })(),
    getOne: result => `${endpoint}/${bucket}/${filename}`,
    get: result => {
      Object.keys(result).map(filename => {
        return result[filename] = `${endpoint}/${bucket}/${result[filename]}`;
      });
      return result;
    }
  };
};