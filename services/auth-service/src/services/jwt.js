const jwt = require('jsonwebtoken');
const {privateKey, publicKeys, activeKid, tokenExpiry, refreshExpiry} = require('../../config');

function signAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        },
        privateKey,
        {
            algorithm: 'RS256',
            expiresIn: tokenExpiry,
            header: {kid: activeKid}
        }
    );
}

function signRefreshToken(user) {
    return jwt.sign(
        {sub: user.id},
        privateKey,
        {
            algorithm: 'RS256',
            expiresIn: refreshExpiry,
            header: {kid: activeKid}
        }
    );
}

function verifyToken(token) {
    const decodedHeader = jwt.decode(token, {complete: true});
    const kid = decodedHeader?.header?.kid;
    const pubKey = publicKeys[kid];
    if (!pubKey) throw new Error('Unknown kid');
    return jwt.verify(token, pubKey);
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyToken
};
