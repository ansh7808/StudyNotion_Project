
const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
exports.createCategory = async (req, res) => {
  try {
     //fetch data
    const { name, description } = req.body;
    //validation
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
     //create entry in db
    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });
    //return response
    console.log(CategorysDetails);
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } 
  catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

//getAlltags handler function
// exports.showAlltags = async(req,res) => {
//     try{
//         const allTags = await Tag.find({},{name:true,description:true});
//         res.status(200).json({
//             success:true,
//             message:"All tags returned successfully",
//             allTags,
//         })
//     }
//     catch(error){
//         return res.status(500).json({
//             success:false,
//             message:error.message,
//         })
//     }
// }

exports.showAllCategories = async (req, res) => {
    try {
      const allCategories = await Category.find().populate("courses");
      const categoriesWithPublishedCourses = allCategories.filter((category) =>
        category.courses.some((course) => course.status === "Published")
      );
      res.status(200).json({
        success: true,
        data:allCategories , //allCategories
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

 exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryid
      const { categoryId } = req.body;
      //get courses for specified categoryId
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec();
     //valiation
      if (!selectedCategory) {
        console.log("Category not found.");
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
  
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.");
        return res.status(200).json({
          success: true,
          message: "No courses found for the selected category.",
        });
      }
    //get courses for different categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      });

      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
      console.log();
   //get top 10 selling courses
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate:{
            path:"instructor",
          },
        })
        .exec();
      const allCourses = allCategories.flatMap((category) => category.courses);
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);
    
        //return response
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };