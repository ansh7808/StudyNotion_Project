import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/Operation/settingsAPI"
import IconBtn from "../../../common/IconBtn"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(submitPasswordForm)}>
        <div className='my-5 rounded-md border border-richblack-700 bg-richblack-800 p-8 px-12'>
          <h1 className='text-lg mb-6 font-semibold text-richblack-5 tracking-wider' >Password</h1>

          <div className='flex flex-col lg:flex-row gap-5' >
            <div className='relative flex flex-col gap-x-2 w-full' >
              <label htmlFor="oldPassword" className='label-style tracking-wider mb-1' >Current Password <span className='text-pink-100'>*</span></label>
              <input
                name='oldPassword'
                id='oldPassword'
                placeholder='Enter Current Password'
                type={showOldPassword ? 'text' : 'password'}
                style={{
                    boxShadow:"inset 0px -1px rgba(255,255,255,0.18)"
                  }}
                 className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 
                 form-style placeholder:text-sm placeholder:tracking-wider !pr-12"
               
                {...register('oldPassword', {
                  required: {
                    value: true,
                    message: 'Please enter your New Password'
                  },
                  minLength: {
                    value: 6,
                    message: 'Invalid password'
                  }
                })}
              />

              <span onClick={() => setShowOldPassword(prev => !prev)} className='absolute right-3 top-[38px] cursor-pointer' >
                {
                  showOldPassword ?
                    <AiOutlineEyeInvisible fontSize={24} fill='#AFB2BF' />
                    :
                    <AiOutlineEye fontSize={24} fill='#AFB2BF' />
                }
              </span>

              {
                errors.oldPassword && <p className='input-error-style' >{errors.oldPassword?.message}</p>
              }
            </div>

            <div className='relative flex flex-col gap-x-2 w-full' >
              <label htmlFor="newPassword" className='label-style uppercase tracking-wider mb-1' >New Password <span className='text-pink-100'>*</span></label>
              <input
                name='newPassword'
                id='newPassword'
                placeholder='Enter Current Password'
                type={showNewPassword ? 'text' : 'password'}
                style={{
                    boxShadow:"inset 0px -1px rgba(255,255,255,0.18)"
                  }}
                 className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 
                 form-style placeholder:text-sm placeholder:tracking-wider !pr-12"
                
                {...register('newPassword', {
                  required: {
                    value: true,
                    message: 'Please enter your New Password'
                  },
                  minLength: {
                    value: 6,
                    message: 'Password length must be atleast 6'
                  }
                })}
              />

              <span onClick={() => setShowNewPassword(prev => !prev)} className='absolute right-3 top-[38px] cursor-pointer' >
                {
                  showNewPassword ?
                    <AiOutlineEyeInvisible fontSize={24} fill='#AFB2BF' />
                    :
                    <AiOutlineEye fontSize={24} fill='#AFB2BF' />
                }
              </span>

              {
                errors.newPassword && <p className='input-error-style' >{errors.newPassword?.message}</p>
              }
            </div>
          </div>
        </div>


        <div className='flex justify-end gap-2'>
          <button onClick={() => navigate('/dashboard/my-profile')} className={`rounded-md bg-richblack-700
           lg:py-2 py-1 lg:px-5 px-2 font-semibold text-richblack-50 tracking-wider 
          ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}>Cancel</button>

          <IconBtn type={'submit'} disabled={loading} customClasses={`${loading} lg:py-2 lg:px-5`} text={loading ? 'Updating...' : 'Update'} />
        </div>

      </form>

    </div>
  )
}