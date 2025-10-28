import jwt from 'jsonwebtoken';
import passport from 'passport';

export default class AuthController{
    login = async (req, res) => {        
        passport.authenticate('local', {session: false}, (err, usuario, info) => {
            if (err || !usuario) {
                return res.status(400).json({
                    estado: false,
                    mensaje: "Solicitud incorrecta." 
                })
            }
            
            // armamos token
            req.login(usuario, { session: false }, (err) => {
                if(err){
                    res.send(err);
                }
                // con datos del user y exp
                const token = jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: '1h'});

                return res.json({
                    estado: true, 
                    token: token
                });
            })
        })(req, res);
    }
}   