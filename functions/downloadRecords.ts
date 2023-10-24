const CryptoJS = require("crypto-js")

const SAS_URL = process.env.NEXT_PUBLIC_SAS_URL
const ENCRYPTED_SAS_TOKEN = process.env.NEXT_PUBLIC_ENCRYPTED_SAS_TOKEN
const DECRYPTED_SAS_TOKEN_LENGTH = 134

export default async function downloadRecords(password: string) {
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
  if (decryptedSasToken.length !== DECRYPTED_SAS_TOKEN_LENGTH) {
    throw new Error("Invalid password")
  }

  // Download the records using the decrypted SAS token
  const sasUrlWithToken = `${SAS_URL}?${decryptedSasToken}`
  try {
    const response = await fetch(sasUrlWithToken)
    if (response.ok) {
      const jsonText = await response.text()
      const jsonArray = JSON.parse(jsonText)
      return jsonArray
    } else {
      throw new Error("Failed to download records")
    }
  } catch (error) {
    throw new Error("Failed to connect to the server")
  }
}
