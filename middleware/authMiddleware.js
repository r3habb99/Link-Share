const jwtUtils = require("../utils/jwtUtils");
const responseMessages = require("../Responses/responseMessages");

exports.authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  const passedId = req.headers.id;
  // console.log(passedId);
  if (!token) {
    return res
      .status(401)
      .json(responseMessages.error(401, "Authentication required "));
  }
  const decoded = jwtUtils.verifyToken(token);
  // console.log(decoded);

  if (passedId !== decoded.userId) {
    return res.status(401).json(responseMessages.error(401, "Invalid token"));
  }
  if (!decoded || decoded instanceof Error) {
    return res.status(401).json(responseMessages.error(401, "Invalid token"));
  }
  // console.log("end auth");
  req.userId = decoded.userId;
  next();
};
