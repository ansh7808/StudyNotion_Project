const {instance} =  require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const{courseEnrollmentEmail} = require("../mail/templates/CourseEnrollmentEmail");
const{default:mongoose} = require("mongoose");
const crypto = require("crypto");
const { paymentSuccessEmail } = require("../mail/templates/PaymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

exports.capturePayment = async (req, res) => {
  //get courseID and userID
  console.log("Request Body:", req.body);


  const { courses } = req.body;
  const userId = req.user.id;

  console.log("User ID:", req.user?.id);
   //validation
    //valid CourseId
    
  if (!courses.length) {
    console.log("Courses array is empty.");
    return res.json({ success: false, message: "Please Provide Course ID" });
  }
    //valid courseDetail
  let total_amount = 0;
  for (const course_id of courses) {
    let course;
    console.log("Processing course ID:", course_id);
    try {

      course = await Course.findById(course_id);

      console.log("Fetched course details:", course);

      if (!course) {
        console.log(`Course not found for ID: ${course_id}`);
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" });
      }
       //user already pay for the same course
      const uid = new mongoose.Types.ObjectId(userId);
      console.log(`Checking if user ${userId} is already enrolled in course ${course_id}`);
      console.log("Enrolled students:", course.studentsEnroled)

      if (course.studentsEnroled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }
      total_amount += course.price;

      console.log(`Total amount so far: ${total_amount}`);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
   //order create
  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };
  console.log("Razorpay order creation options:", options);
  console.log("Razorpay Key:", process.env.RAZORPAY_KEY);
  console.log("Razorpay Secret:", process.env.RAZORPAY_SECRET);
  try {
    const paymentResponse = await instance.orders.create(options);
    console.log("Razorpay order response:", paymentResponse);
    
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};
//capture the payment and initiate razorpay order
// exports.capturePayment = async (req, res) => {
    
//     const { courses } = req.body;
//     const userId = req.user.id;

   
//     if (!courses.length) {
//       return res.json({ success: false, message: "Please Provide Course ID" });
//     }
  
//     let total_amount = 0;
//     for (const course_id of courses) {
//       let course;
//       try {
//         course = await Course.findById(course_id);
//         if (!course) {
//           return res
//             .status(200)
//             .json({ success: false, message: "Could not find the Course" });
//         }
       
//         const uid = new mongoose.Types.ObjectId(userId);
//         if (course.studentsEnroled.includes(uid)) {
//           return res
//             .status(200)
//             .json({ success: false, message: "Student is already Enrolled" });
//         }
//         total_amount += course.price;
//       }

//        catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: error.message });
//       }
//     }
   
//     const options = {
//         amount: total_amount * 100,
//         currency: "INR",
//         receipt: Math.random(Date.now()).toString(),
//         // notes:{
//         //     courseId: courses.course_id,
//         //     userId,
//         // }
//       };
//       try {
//         //initiate payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);
//         res.json({
//           success: true,
//           message: paymentResponse,
//           // courseName:courses.courseName,
//           // courseDescription:courses.courseDescription,
//           // thumbnail:courses.thumbnail,
//           // orderId:paymentResponse.id,
//           // currency:paymentResponse.currency,
//           // amount:paymentResponse.amount,
//         });
//       } catch (error) {
//         console.log(error);
//         res
//           .status(500)
//           .json({ success: false, message: "Could not initiate order." });
//       }
//     };

//verify signature of razorpay and server

// exports.verifyPayment = async(req,res) =>{
//     const webhookSecret ="12345678";

//     const signature = req.headers["x-razorpay-signature"];

//     const shasum = crypto.createHmac("sha256",webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature===digest){
//         console.log("Payment is Authorised");
        
//         const {courseId,userId} = req.body.payload.entity.notes;

//         try{
//             //fulfill the action

//             //find the course and enroll the student in it
//             const enrolledCourse = await Course.findOneAndUpdate({id:courseId
//             },
//         {$push:{studentsEnrolled:userId}},
//             {
//                 new :true
//             },)
//           if(!enrolledCourse){
//             return res.status(500).json({
//                 success:false,
//                 message:'Course Not found',
//             });
//           }
//       console.log(enrolledCourse);

//       //find the student and add the course to their list of enroled courses
//         const enrolledStuent = await User.findOneAndUpdate(
//             {_id:userId},
//             {$push:{courses:courseId}},
//             {new:true},
//         );
//        //confirmation mail send
//       const emailResponse = await mailSender(
//         enrolledStuent.email,
//         "Congratulations from Codehelp",
//         "Congratulations,you are onboarded into new Codehelp Course"
//       )
//       console.log(emailResponse);
//       return res.status(200).json({
//         success:true,
//         message:"Signature verified and course added",
//       });
//         }
//      catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:true,
//             message : error.message,
//         })
//      }
//     }
//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid Request',
//         })
//     }
// }

//if above not work
exports.verifyPayment = async (req, res) => {
   const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      return res.status(200).json({ success: false, message: "Payment Failed" });
    }
    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await enrollStudents(courses, userId, res);
      return res.status(200).json({ success: true, message: "Payment Verified" });
    }
    return res.status(200).json({ success: false, message: "Payment Failed" });
  };

  const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please Provide Course ID and User ID",
        });
    }
  
    for (const courseId of courses) {
      try {
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnroled: userId } },
          { new: true }  //updated response milega
        );
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" });
        }
        console.log("Updated course: ", enrolledCourse);
  
        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        });
  
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        );
  
        console.log("Enrolled student: ", enrolledStudent);
  
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        );
  
        console.log("Email sent successfully: ", emailResponse.response);
      } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, error: error.message });
      }
    }
  };

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } 
  catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};
