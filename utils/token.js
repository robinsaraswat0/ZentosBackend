const Web3Token = require("web3-token");

const sendToken = (user, statusCode, res, token) => {
  const { body } = Web3Token.verify(token);
  // options for Cookie
  const options = {
    expires: new Date(body?.["expiration-time"]),
    httpOnly: true,
    sameSite:'none',
    secure:true
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    userDetails: user,
    token,
  });
};

module.exports = sendToken;
