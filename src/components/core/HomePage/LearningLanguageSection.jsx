import React from 'react'
import HighlightText from './HighlightText'
import CTAButton from "../../../components/core/HomePage/Button";
import Know_your_progress from "../../../Asset/Image/Know_your_progress.png";
import Compare_with_others from "../../../Asset/Image/Compare_with_others.svg";
import Plan_your_lessons from "../../../Asset/Image/Plan_your_lessons.svg"

const LearningLanguageSection = () => {
    return (
      <div className='mt-[130px]'> 
      <div className='flex flex-col gap-5 items-center'>
        
        <div className="text-4xl font-semibold text-center ">
        Your swiss knife for
        <HighlightText text={"learning any language"} />
        </div>

        <div  className="text-center text-richblack-700 font-medium lg:w-[70%] mx-auto leading-6 text-base mt-3">
        Using spin making learning multiple languages easy. with 20+
              languages realistic voice-over, progress tracking, custom schedule
              and more.
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center mt-8 lg:mt-0">
        <img
                src={Know_your_progress}
                alt=""
                className="object-contain  lg:-mr-32 "
              />
              <img
                src={Compare_with_others}
                alt=""
                className="object-contain lg:-mb-10 lg:-mt-0 -mt-12"
              />
              <img
                src={Plan_your_lessons}
                alt=""
                className="object-contain  lg:-ml-36 lg:-mt-5 -mt-16"
              />
            
        </div>

        <div className="w-fit  lg:mb-20  lg:mt-10 mb-8 -mt-5">
            <CTAButton active={true} linkto={"/signup"}>
              <div className="">Learn More</div>
            </CTAButton>
          </div>

      </div>
     </div>
  )
}

export default LearningLanguageSection