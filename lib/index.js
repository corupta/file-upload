const uuid = require("uuid")
const path = require("path")
const mount = require("koa-mount")
const parse = require("busboy-file-parser")
const dateformat = require("dateformat")

/*
headers: { content-type: ***, content-disposition: ..., content-transfer-encoding: ... }
headers: { content-type: multipart/*
 */

const imageUploadCreator = (opts) => {

  let store
  try {
    store = require(`./${opts.provider}`)(opts)
  } catch (err) {
    throw new Error(`Error: ${err}`)
  }

  let {mimetypes, exts, filename} = opts
  if(mimetypes) mimetypes = mimetypes.map(m => m.toLocaleLowerCase())
  if(exts) exts = exts.map(e => e.toLocaleLowerCase())

  // already parsed files
  return async (files) => {
    if (!files) {
      return {
        error: {
          type: 400,
          message: 'No files are given'
        }
      }
    }

    if (!Array.isArray(files)) {
      files = [files]
    }


    // Check if any file is not valid mimetype
    if (mimetypes) {
      const invalidFiles = files.filter(file => {
        return !mimetypes.includes(file.mimeType.toLocaleLowerCase())
      })

      // Return err if any not valid
      if (invalidFiles.length !== 0) {
        return { 
        	error: {
        		type: 400,
        		message: `Error: Invalid type of files ${invalidFiles.map(file => `${file.filename}[${file.mimeType}]`)}`
        	}
        }
      }
    }

    // Check if any file is not valid ext
    if (exts) {
      const invalidFiles = files.filter(file => {
        return !exts.includes(file.filename.substring(file.filename.lastIndexOf(".") + 1).toLocaleLowerCase())
      })

      // Return err if any not valid
      if (invalidFiles.length !== 0) {
        return { 
        	error: {
        		type: 400,
        		message: `Error: Invalid type of files ${invalidFiles.map(file => file.filename)}`
        	}
        }
      }
    }

    // Generate oss path
    let subDir = opts.subDir;
    if (typeof subDir === 'undefined') {
      subDir = { date: true }; // keep default to date as the original code. / send null for emtpy string
    }
    if (typeof subDir === 'object') {
      if (subDir.date === true) {
        subDir = () => dateformat(new Date(), "yyyy/mm/dd")
      }
      if (subDir instanceof Date) {
        subDir = dateformat(subDir, "yyyy/mm/dd")
      } else if (subDir.random === true) {
        subDir = () => uuid.v4();
      } else if (subDir) { // can be null
        return {
          error: {
            type: 501,
            message: `Error: Invalid subDir option, ${ subDir } => ${ Object.keys(subDir) } (Allowed: { random: true }, Date object, { date: true }, string)`
          }
        }
      }
    }
    if (typeof subDir !== 'function') {
      subDir = () => `${subDir || ""}`;
    }

    const storeDir = opts.storeDir ? `${opts.storeDir}/` : "";

    let result = {}

    files.forEach(file => {
      const fname = typeof filename === "function" ?
        filename(file) : `${uuid.v4()}${path.extname(file.filename)}`
      const newSubDir = subDir(file);
      result[file.filename] = {
        path: `${storeDir}${ newSubDir ? `${newSubDir}/` : ''}`,
        filename: fname,
      }
    })

    // Upload to OSS or folders
    try {
      await Promise.all(files.map(file => {
        const { path, filename } = result[file.filename]
        return store.put(`${path ? `${path}/` : ''}${filename}`, file)
      }))
    } catch (err) {
      return { 
      	error: {
      		type: 500,
      		message: `Error: ${err}`
      	}
      }
    }

    Object.keys(result).forEach(k => {
      const { path, filename } = result[k]
      result[k] = {
        url: `${path}/${encodeURI(filename)}`,
        filename
      }
    });

    return {
      results: result,
      body: store.get(result.map(({url})=>url))
    };


    // Return result
    ctx.status = 200
    // Support < IE 10 browser
    ctx.res.setHeader("Content-Type", "text/html;charset=UTF-8")
    Object.keys(result).forEach(k => {
      const { path, filename } = result[k]
      result[k] = `${path}/${encodeURI(filename)}`
    })
    ctx.body = JSON.stringify(store.get(result))
    return
  }
}

const imageUploadMiddlewareFunction = (opts) => {
  const imageUploadFunction = imageUploadCreator(opts)
  return async(ctx, next) => {
    if ("POST" !== ctx.method && !ctx.request.is("multipart/*")) {
      return await
      next()
    }
    const {files} = await parse(ctx.req)
    const result = await imageUploadFunction(files)
    if (result.error) {
      ctx.status = result.error.type
      ctx.body = result.error.message
    } else {
      ctx.status = 200
      ctx.res.setHeader("Content-Type", "text/html;charset=UTF-8")
      ctx.body = JSON.stringify(result.body)
    }
  }
}

const imageUploadMiddlewareCreator = (options) => {
  if (!options.url) {
    throw new Error("Can not find option url")
  }
  return mount(options.url, imageUploadMiddlewareFunction(options))
}

module.exports = {
  imageUploadMiddlewareCreator,
  imageUploadMiddleware: imageUploadMiddlewareCreator, // alias
  imageUploadCreator,
  imageUpload: imageUploadCreator // alias
}
