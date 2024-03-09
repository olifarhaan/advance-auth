console.log(process.env.JWT_ACCESS_TOKEN_EXPIRE,"jwt access token----" )

const ACCESS_TOKEN_EXPIRE_TIME =
  parseInt((process.env.JWT_ACCESS_TOKEN_EXPIRE as string) || "30", 10) *
  60 *
  1000;
const REFRESH_TOKEN_EXPIRE_TIME =
  parseInt((process.env.JWT_REFRESH_TOKEN_EXPIRE as string) || "14", 10) *
  24 *
  60 *
  60 *
  1000;

  export {ACCESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME}