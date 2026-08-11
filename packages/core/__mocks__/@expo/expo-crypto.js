
export function digestStringAsync(algorithm, data) { 
    return Promise.resolve(`Mocked ${data} encoded as ${algorithm}`);
}

export const CryptoDigestAlgorithm = {
    SHA256: 'SHA-256'
};