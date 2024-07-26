function encryptData(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

function decryptData(ciphertext, key) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Secret Key is here only for demonstration purposes. In a real-world scenario, it should be stored securely.
const secretKey = 'g^XDgw%*T3p%KAO64JQGE60mlVfEtR0ahWB8mIou*wLjFv#b9B0&s3X0aIFE!FWPlC2uGH@sySL@qHOh';


// Get from Local Storage
function getFromLocalStorage(key, secret) {
    const encryptedData = localStorage.getItem(key);
    if (encryptedData) {
        return decryptData(encryptedData, secret);
    }
    return null;
}
