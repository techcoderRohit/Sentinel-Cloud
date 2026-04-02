const authorizeRoles = (...roles) => {
    return (req , res , next) => {
        //1. check karein ki req.user exist karta h (protect middleware pehle chalna chahiye)
        if(!req.user){
            return res.status(401).json({
                message : "Not authorized, user data missing"
            });
        }
        //2. check karein ki user ka role allowed role ki list mein h ya nhi
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message : `Access Denied: ${req.user.role} is not allowed`
            });
        }
        //3. agar role match kar gaya, toh agle fuction par bhejein
        next();
    };
};

module.exports = authorizeRoles;