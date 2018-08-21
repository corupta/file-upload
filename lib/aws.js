const AWS = require('aws-sdk')
const util = require("./util")
const fs = require('fs')
module.exports = (options) => {
  let { bucket, accessKeyId, secretAccessKey, endpoint = 'https://s3.amazonaws.com', s3ForcePathStyle, signatureVersion } = options
  if (!(bucket && accessKeyId && secretAccessKey)) {
    throw new Error("Missing option in options: [bucket , accessKeyId , secretAccessKey]")
  }

  const s3 = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    endpoint,
    s3ForcePathStyle,
    signatureVersion
  });

  return {
    put: async (filename, file) => {
      await util.fileResolve(file)
      return new Promise((resolve, reject) => {
        const params = { Bucket: bucket, Key: filename, Body: fs.createReadStream(file.path) };
        s3.putObject(params, (err, data) => {
          if (err)
            reject(err)
          else
            resolve()
        });
      })
    },
    getOne: (result) => `${endpoint}/${bucket}/${filename}`,
    get: (result) => {
      Object.keys(result).map(filename => {
        return result[filename] = `${endpoint}/${bucket}/${result[filename]}`
      })
      return result
    }
  }
}

