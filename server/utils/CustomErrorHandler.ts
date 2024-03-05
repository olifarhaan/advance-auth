export class CustomErrorHandler extends Error{
    statusCode:Number;
    constructor(statusCode: Number, message: string){
        super(message)
        this.statusCode= statusCode
        Error.captureStackTrace(this, this.constructor)
    }
}
