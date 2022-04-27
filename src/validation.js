import hapi from 'joi';

export const registerValidation = (req) =>{
    const schema = hapi.object().keys({
        email: hapi.string().email({ tlds: { allow: ['com', 'net'] } }),
        password: hapi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$'))
    })
    return schema.validate({email: req.body.email, password: req.body.password});
}
