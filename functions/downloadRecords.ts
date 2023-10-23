const CryptoJS = require("crypto-js");

export default async function downloadRecords(password: string) {
  const sasUrl = CryptoJS.AES.decrypt(password, "key").toString(CryptoJS.enc.Utf8)
  const response = await fetch(sasUrl)

  if (response.ok) {
    const jsonText = await response.text()
    const jsonArray = JSON.parse(jsonText)
    return jsonArray
  } else {
    throw new Error("Failed to download records")
  }
}
