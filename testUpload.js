const { imageUpload } = require("./lib")

const config = require('./config')

const options = Object.assign({
  // "storeDir": "terminus",
  // "mimetypes": ['image/png','image/bmp'],
  // "provider": "local",
  // "folder": "public",
  // "urlPath": "images"
  // "provider": "oss",
  // "accessKeyId": "xxxxx",
  // "accessKeySecret": "xxxx",
  // "bucket": "xxxx",
  // "region": "oss-cn-hangzhou"
  // "provider": "cos",
  // "bucket": "b2b",
  // "appId": "xxx",
  // "secretID": "xxx",
  // "secretKey": "xx",
  // "region": "gz"
}, config)

const uploader = imageUpload(options);

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
  console.log('starting function uploadMyTestFile():\n');
  await uploadMyTestFile();
  console.log('finished function uploadMyTestFile()\n\n');
  console.log('starting function uploadMyTestFiles()\n:');
  await uploadMyTestFiles();
  console.log('finished function uploadMyTestFiles()');
}

test();
