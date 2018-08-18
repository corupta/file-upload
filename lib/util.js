module.exports = {
  fileResolve: (file) => {
    if (!file.customParsed) {
      return new Promise((resolve, reject) => {
        file.resume()
        file.on("end", () => {
          resolve()
        })
        file.on("error", (err) => {
          reject(err)
        })
      })
    }
    if (!file.path) {
      throw new Error('path is required in file')
    }
  }
}