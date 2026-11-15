import jwt from "jsonwebtoken"
import {env} from "../../config/env.js"
import { AuthError } from "../../errors/autorization/authErrors.js"

export const verifyAccessToken = (token) =>{
  if(!env.JWT_ACCESS_SECRET){
    throw new AuthError("Secret not set")
  }
  try{
    return jwt.verify(token, env.JWT_ACCESS_SECRET)
  } catch (err){
    throw new AuthError(`Invalid or expired token, ${err.name}`);
  }
}

export const verifyRefreshToken = (token) =>{

  if(!env.JWT_REFRESH_SECRET){
    throw new AuthError("Secret not set")
  }
  try{
    return jwt.verify(token, env.JWT_REFRESH_SECRET)
  } catch (err){
    throw new AuthError(`Invalid or expired token, ${err.name}`);
  }
}