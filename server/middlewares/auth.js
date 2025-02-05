
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

//auth
exports.auth = async(req,res,next) =>{
   try{
    //extract token
    const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");
     //if token missing then return response\
     if (!token) {
        return res.status(401).json({ success: false, message: `Token Missing` });
    }
    //verify the token
    
		try {
			const decode =  jwt.verify(token, process.env.JWT_SECRET);
			console.log(decode);
			req.user = decode;
		} 
        catch (error) {
		   //verification - issue	
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}		
		next();
   }
   catch(error){
    return res.status(401).json({
        success: false,
        message: `Something Went Wrong While Validating the Token`,
    });
   }
}

//isStudent
exports.isStudent = async (req, res, next) => {
	try {
		// const userDetails = await User.findOne({ email: req.user.email });

		// if (userDetails.accountType !== "Student") {
		// 	return res.status(401).json({
		// 		success: false,
		// 		message: "This is a Protected Route for Students",
		// 	});
		// }

        if(req.user.accountType !== "Student"){
            return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
        }
		next();
	} 
    catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
	try {
		

        if(req.user.accountType !== "Instructor"){
        
            return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
        }
		next();
	} 
    catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
	try {
		

        if(req.user.accountType !== "Admin"){
        
            return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
        }
		next();
	} 
    catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
