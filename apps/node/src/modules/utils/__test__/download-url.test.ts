import { downloadUrl } from "../download-url";
import { getAppDataDir } from "../get-appdata-dir";

async function testDownload() {
  console.log("start download")
  const dataURL = getAppDataDir();
  try {
    const ret = await downloadUrl((event) => {
      console.log(event)
    }, "https://google.com", dataURL);
  } catch(err) {
    console.log(err);
  }
}

testDownload();