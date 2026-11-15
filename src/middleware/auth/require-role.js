import { AuthError, ForbiddenError} from "../../errors/autorization/authErrors.js";

export const requireRole = (role) => { 
  return (req,res, next) =>{
    if(!req.user){
      return next(new AuthError("Authentication required"));
    };
    if(req.user.role !== "admin"){
      return next(new ForbiddenError("Access denied"));
    }
    if(req.user.role !== role){ 
     return next(new ForbiddenError("Access denied"));
   };
   next()
  };
};