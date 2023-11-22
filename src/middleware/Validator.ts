import { Joi } from "express-validation"
class Validate {
    public registerValidation = {
        body: Joi.object({
            fullname: Joi.string().regex(/[a-zA-Z]/).required(),
            username : Joi.string().regex(/[a-zA-Z0-9]/).required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required()
        })
    }
    public loginValidation = {
        body: Joi.object({
            user: Joi.string().required(),
            password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required()
        })
    }
    public postValidation = {
        body: Joi.object({
            text: Joi.string(),
            pic: Joi.array()
        })
    }
}
const validator = new Validate()
export default validator