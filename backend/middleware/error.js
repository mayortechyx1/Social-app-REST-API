export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode === 200? 500 : res.statusCode;
  let message = err.message;
  
  if(err.name === "CastError" && err.kind === "ObjectId") {
    status = 404
    message = "Resource not found"
  }

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV !== "development"? null : err.stack
  })
};

export const notFound = (req, res, next) => {
  res.status(400);
  throw new Error('endpoint not found');
};

export const customError = (res, message, status)=>{
  if (!status) status= 500
  res.status(status);
  throw new Error(message)
}