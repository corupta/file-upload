# koa2-file-uploader

[![](https://img.shields.io/npm/v/koa2-file-uploader.svg?style=flat)](https://www.npmjs.com/package/koa2-file-uploader)

koa2 middleware/function to upload file, supports local, oss, cos, obs, azure, aws stores.

This package is a fork from [dzy321/file-upload](https://github.com/dzy321/file-upload) allowing to use the package to upload files with/without using the package as a middleware.
*(Special thanks to [dzy321](https://github.com/dzy321), for creating an all-in-one package to upload to different stores)*
 
With my version, you can use this package for uploading your custom-parsed files & files your server downloads from other websites, etc... (it lets you give a file) 

### Install

```
npm i koa2-file-uploader
```

### Usage As Upload Function

```javascript
const { imageUpload } = require('koa2-file-uploader');

const options = require('./myConfig.js'); // see below for creating Options

async function uploadMyTestFile() { // const uploadMyTestFile = async() => {
  const testFile = new File(["foo"], "foo.txt", {
    type: "text/plain",
  });
  const { result, error }  = await uploader(testFile);
  if (error) {
    console.log(`${error.status}: ${error.message}`);
  } else {
    console.log('successfully uploaded files: ', JSON.stringify(result));
  }
}

async function uploadMyTestFiles() {
  const testFiles = ['aaa', 'bbb', 'ccc', 'ddd', 'eee'].map((title) =>
    new File(["I'm a test file :P", title], `${title}.txt`,
      { type: "text/plain" }));
}

async function test() {
  await uploadMyTestFile();
  console.log('----------');
  await uploadMyTestFiles();
}

test();
```

#### File Object
```javascript
// file or each file in files is in below format
var file = {
  file: binary, // binary image data
  filename: string, // photo.png
  mimeType: string, // image/png
  path: string, // path of tmp file location  
  
}

```

### Usage As Middleware

```javascript
const Koa = require('koa');
const app = new Koa();

const { imageUploadMiddleware } = require('koa2-file-uploader');

const options = require('./myConfig.js'); // see below for creating Options

app.use(imageUploadMiddleware(options));
```


### Options

#### General Options:
```javascript
options = {
  "storeDir": "uploadsFolder", // to upload to /uploadsFolder/...
  "subDir": (file) => str || { date: true } || "customStr" || new Date() || null,
  // default is { date: true }
  /* dynamic subDir options (different subDir for each file)
   * (file) => str: uploads to /storeDir/str/... (File is parsed File) 
   * { date: true } (default) => uploads to /storeDir/yyyy/mm/dd/... (current date)
   * { date: format } => uploads to /storeDir/{format}/... (current date)
   * { random: true } => uploads to /storeDir/{randomHex}/...
   */
  /* static subDir options (same subDir for each file)
   * str: uploads to /storeDir/str/...
   * Date: uploads to /storeDir/yyyy/mm/dd... (given date object such as new Date())
   * null: uploads to /storeDir/... (You must explicitly give null to omit sub directory)
   */
  "mimetypes": ['image/png','image/bmp'], // accept only those
  // for a list of mimetypes http://www.freeformatter.com/mime-types-list.html
  "filename": (file) => str || null
  // (file) => str uploads to /storeDir/subDir/str (you must provide extension in function return)
  // null (default)
}
```
#### Route Path for Middleware:
```javascript
options = {
  "url": '/api/upload'
}
```

#### Provider Specific Options:

- support upload to local dir

```javascript
options = {
  "url": "/api/upload",
  "provider": "local",
  "mimetypes": ["image/png","image/bmp"],
  "storeDir": "images",
  "folder": "uploads/media",
  "urlPath": "static" // base for urls it returns
  // file is put to ${folder}/${storeDir}/${subDir}/${file}
  // result is returned as ${urlPath}/${storeDir}/${subDir}/${file}
  // so in that example, image is uploaded to /uploads/media/images/abcdefg.png
  // and the result is returned as { body: ['/static/images/abcdefg.png'] } 
}
```

- support upload to oss

```javascript
options["upload"] = {
  "url": '/api/upload',
  "provider": "oss",
  "storeDir": 'xxx',
  "mimetypes": ['image/png','image/bmp'],
  "accessKeyId": "key",
  "accessKeySecret": "secret",
  "bucket": "terminus-designer",
  "region": "oss-cn-hangzhou",
  "filename": (file) => `${new Date().getTime()}-${file.filename}`, // default null
  "targetProtocol": "http", // default null
  "attachment": true // default null
}
```

- support upload to cos

```javascript
options["upload"] = {
  "url": '/api/upload',
  "provider": "cos",
  "storeDir": 'xxx',
  "bucket": "b2b",
  "appId": "xxx",
  "secretID": "xxx",
  "secretKey": "xx",
  "region": "gz"
}
```

- support upload to obs

```javascript
options["upload"] = {
  "url": '/api/upload',
  "provider": "obs",
  "bucket": "****",
  "accessKeyId": "****",
  "accessKeySecret": "****",
  "server": "****"
}
```

- support upload to azure

```javascript
options["upload"] = {
  "url": '/api/upload',
  "provider": "azure", 
  "container": "xxxx",
  "account": "xxxx",
  "connectionString": "xxxx",
}
```

- support upload to aws

```javascript
options["upload"] = {
  "url": '/api/upload',
  "endpoint": "http://localhost:801",
  "provider": "aws", 
  "bucket": "****",
  "accessKeyId": "****",
  "secretAccessKey": "****",
  "s3ForcePathStyle": true, // minio support
  "signatureVersion": "v4" // minio support
}
```

### Requirements

- Node v6.0+
