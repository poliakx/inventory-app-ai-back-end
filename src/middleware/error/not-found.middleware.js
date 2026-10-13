import { NotFoundError } from "../../errors/base.error.js"

export const notFoundMiddleware = (req, res, next) => {
  return next( new NotFoundError(`Route`))
}