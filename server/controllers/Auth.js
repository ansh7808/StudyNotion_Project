const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require("dotenv").config();

//sendOTP
exports.sendOTP = async(req,res) => {
   
    try{
        //fetch email from request ki body
        const {email} = req.body;

        //check if user already exists
        const checkUserPresent = await User.findOne({email});

        //if user already exists,then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        //generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated:",otp);
        
        //check unique otp or not
        let result = await OTP.findOne({otp:otp});

        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }
      
        const otpPayload = {email,otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //reurn response successful
        res.status(200).json({
            success:true,
            message:'OTP sent Successfully',
            otp,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            sucess:false,
            message:error.message,
        })
    }

};

//signup
exports.signup = async(req,res) => {
    
   try{
     //data fetch from request ki body
     const{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType, // either student or instructor never empty
       // contactNumber,//here we kept optional
        otp
    } = req.body;
    //validate krlo
    if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
        return res.status(403).json({
            sucess:false,
            message:"All fields are required",
        })
    }
    //2 password match krlo
    if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Password and Confirm Password do not match. Please try again.",
        });
      }
    //check user already exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);
    //validate OTP

    if (recentOtp.length == 0) {
        //otp not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
        //invalid otp
        //enter otp and generated otp not same
      return res.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    }

    
    //Hash Password
    const hashedPassword = await bcrypt.hash(password,10);
    //entry create in DB
    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      });
      const user = await User.create({
        firstName,
        lastName,
        email,
       // contactNumber,
        password: hashedPassword,
        accountType,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      });

    //return res

    return res.status(200).json({
        success:true,
        message:'User is registered successfully',
        user,
    });
   } 

   catch(error){
     console.log(error);
     return res.status(500).json({
        success:false,
        message:"User cannot be registered please try again",
     })
   }


}

//login
exports.login = async(req,res) => {
    try{
        //get data from req body
        const { email, password } = req.body;
        //validation data
        if (!email || !password) {
            return res.status(400).json({
              success: false,
              message: `Please Fill up All the Required Fields`,
            });
          }
        //user check exist or not 
        const user = await User.findOne({ email }).populate("additionalDetails");

        if (!user) {
          return res.status(401).json({
            success: false,
            message: `User is not Registered with Us Please SignUp to Continue`,
          });
        }
        //generate JWT,after password matching
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                 id: user._id,
                accountType: user.accountType 
            }
            const token = jwt.sign(
             payload,
              process.env.JWT_SECRET,
              {
                expiresIn: "24h",
              }
            );
      
            user.token = token;
            user.password = undefined;
             ///create cookies and send response
            const options = {
              expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({
              success: true,
              token,
              user,
              message: `User Login Success`,
            });
          }
           else {
            return res.status(401).json({
              success: false,
              message: `Password is incorrect`,
            });
          }

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
    })
}
};


//changepassword
exports.changePassword = async(req,res) => {
    try{
    //get data from req body
    const userDetails = await User.findById(req.user.id);

    //get oldPassword, newPassword, confirmNewPassword
    const { oldPassword, newPassword } = req.body;
    //validation
    const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      );
      if (!isPasswordMatch) {
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" });
      }
      
     
    //update pwd in DB
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );
    //send mail - Password updated
    try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        );
        console.log("Email sent successfully:", emailResponse.response);
      }
       catch (error) {
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        });
      }

    //return response
    return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
}
 
catch (error) {
  console.error("Error occurred while updating password:", error);
  return res.status(500).json({
    success: false,
    message: "Error occurred while updating password",
    error: error.message,
  });
}
};