import path from "path";
import { downloadUrl } from "../download-url";
import { getAppDataDir } from "../get-appdata-dir";

async function testDownload() {
  console.log("start download")
  const dataURL = getAppDataDir();
  try {
    const ret = await downloadUrl((event) => {
      console.log(event)
    }, "https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh", path.resolve(dataURL, "Miniconda3-latest-MacOSX-x86_64.sh"));
  } catch(err) {
    console.log(err);
  }
}

testDownload();