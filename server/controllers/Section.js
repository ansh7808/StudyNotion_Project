const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
     //data validation
     if (!sectionName || !courseId) {
        return res.status(400).json({
          success: false,
          message: "Missing required properties",
        });
      }
    
    //create section
    const newSection = await Section.create({ sectionName });
     //update course with section object_id
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
   //return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  }
   catch (error) {
    res.status(500).json({
      success: false,
      message: "unable to create section, try again",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
    try {
        //data input
      const { sectionName, sectionId, courseId } = req.body;
      //data validation
      if (!sectionName || !sectionId) {
        return res.status(400).json({
          success: false,
          message: "Missing required properties",
        });
      }
      //update data
      const section = await Section.findByIdAndUpdate(
        sectionId,
        { sectionName },
        { new: true }
      );
      const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();
      console.log(course);
      //return response
    return  res.status(200).json({
        success: true,
        message: 'section updated successfully',
        data: course,
      });
    } 
    catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  exports.deleteSection = async (req, res) => {
    try {
        //TODO-[Testing]- do we need to delete the entry from the course schema?
        //get ID - assuming that we are sending ID in params
        // const{sectionId} = req.params;
      const { sectionId, courseId } = req.body;
      await Course.findByIdAndUpdate(courseId, {
        $pull: {
          courseContent: sectionId,
        },
      });
      const section = await Section.findById(sectionId);
      console.log(sectionId, courseId);
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Section not found",
        });
      }
  
      //delete subSection
      await SubSection.deleteMany({ _id: { $in: section.subSection } });
     
    //use find by id and delete
      await Section.findByIdAndDelete(sectionId);
  
      const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();

  //return response
      res.status(200).json({
        success: true,
        message: "Section deleted",
       data: course,
      });
    } 
    catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };