const CryptoJS = require("crypto-js")

const SAS_URL = process.env.NEXT_PUBLIC_SAS_URL
const ENCRYPTED_SAS_TOKEN = process.env.NEXT_PUBLIC_ENCRYPTED_SAS_TOKEN
const DECRYPTED_SAS_TOKEN_LENGTH = process.env.NEXT_PUBLIC_DECRYPTED_SAS_TOKEN_LEN

export default async function downloadJsonData(password: string) {
  // Validate the password
  if (password.length < 8 || password.length > 32) {
    throw new Error("Invalid password")
  }

  // Decrypt the encrypted SAS token using the password
  let decryptedSasToken = ""
  try {
    // Password is the encryption key
    decryptedSasToken = CryptoJS.AES.decrypt(
      ENCRYPTED_SAS_TOKEN,
      password
    ).toString(CryptoJS.enc.Utf8)
  } catch (error) {
    throw new Error("Invalid password")
  }

  // Validate the decrypted token
  if (decryptedSasToken.length.toString() !== DECRYPTED_SAS_TOKEN_LENGTH) {
    throw new Error("Invalid password")
  }

  // Download the JSON data using the decrypted SAS token
  const sasUrlWithToken = `${SAS_URL}?${decryptedSasToken}`

  try {
    const response = await fetch(sasUrlWithToken)
    if (response.ok) {
      const jsonText = await response.text()
      const jsonArray = JSON.parse(jsonText)
      return jsonArray
    }
  } catch {
    // You'd think that we should throw an error here, but we don't want to do that because, for
    // some reason, whenever the first request is made during login, the fetch fails and I can't
    // work out why. Throwing an exception would make an error appear on the login page every
    // time someone logs in, which is not what we want.
    return null
  }
}
