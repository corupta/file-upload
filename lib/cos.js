const qcloud = require("qcloud_cos_v4")
const util = require("./util")

module.exports = (options) => {
  // {
  //   bucket: "xxxx",
  //   appId: "xxxx",
  //   secretID: "xxxx",
  //   secretKey: "xxxx",
  //   region: "gz|sh|tj"
  // }
  let { bucket, appId, secretID, secretKey, region, targetHost, targetProtocol } = options
  if (!(bucket && appId && secretID && secretKey && region)) {
    throw new Error("Missing option in options: [bucket, appId, secretID, secretKey, bucket, region]")
  }
  qcloud.conf.setAppInfo(appId, secretID, secretKey, region)
  const cos = qcloud.cos

  if (targetProtocol) {
    targetProtocol = `${targetProtocol}:`
  } else {
    targetProtocol = ""
  }
  if (!targetHost) {
    targetHost = `${bucket}-${appId}.file.myqcloud.com`
  }

  return {
    put: async (filename, file) => {
      await util.fileResolve(file)
      return new Promise((resolve, reject) => {
        cos.upload(file.path, bucket, filename, "", 1, (ret) => {
          if (ret.code == 0) {
            resolve()
          } else {
            reject(`Code: ${ret.code} .Message: ${ret.message}`)
          }
        })
      })
    },
    getOne: (filename) => `${targetProtocol}//${targetHost}/${filename}`,
    get: (result) => {
      Object.keys(result).map(filename => {
        return result[filename] = `${targetProtocol}//${targetHost}/${result[filename]}`
      })
      return result
    }
  }
}
