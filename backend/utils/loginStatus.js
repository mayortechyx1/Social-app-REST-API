import jwt from "jsonwebtoken";
import {customError} from "../middleware/error.js";

const loginStatus = (req, res, id) => {
  let token
  token = req.cookies.jwt;
  if(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(id, decoded.userId)

    if (id === decoded.userId) {
      customError(res,"Already logged in!", 400);
    }
    res.status(400);
    throw new Error('please log out if you want to log into another account')
  }  
};

export default loginStatus;