const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")

module.exports = (options) => {
  // {
  //    folder:  "/public/images",
  //    urlPath: "/images"
  // }

  if (!(options.folder)) {
    throw new Error("Missing option in options: [folder]")
  }

  if (!options.urlPath) {
    options.urlPath = options.folder
  }

  return {
    put: (filename, file) => {
      return new Promise((resolve, reject) => {
        const filepath = path.join(process.cwd(), options.folder, filename)
        mkdirp.sync(path.dirname(filepath))
        const inFile = fs.createReadStream(file.path);
        const stream = fs.createWriteStream(filepath)
        inFile.pipe(stream)
        inFile.on("end", () => { return resolve(filename) })
      })
    },
    getOne: (filename) => `${path.join(`/${options.urlPath}`, filename)}`,
    get: (result) => {
      Object.keys(result).map(filename => {
        return result[filename] = `/${path.join(options.urlPath, result[filename])}`
      })
      return result
    }
  }
}
