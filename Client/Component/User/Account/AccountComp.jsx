import UserIcon from '../../../Assets/UserIcon'
import TruckIcon from '../../../Assets/TruckIcon'
import HeartIcon from '../../../Assets/HeartIcon'
import CartIcon from '../../../Assets/CartIcon'
import LocationIcon from '../../../Assets/LocationIcon'
import LogoutIcon from '../../../Assets/logoutIcon'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import { useState } from 'react'
import { userAxios, userCheck, ServerId } from '../../../Config/Server'
import toast from 'react-hot-toast';
import { Countries } from '../../../Config/GlobalData';

function AccountComp() {
  const navigate = useRouter()
  const { userLogged, setUserLogged } = useContext(ContentControl)

  const [profile, setProfile] = useState({
    name: userLogged.name,
    countryCode: userLogged.countryCode || '+91',
    country: userLogged.country || 'India',
    number: userLogged.number,
    email: userLogged.email,
    password: '',
    pass4email: ''
  })

  const [password, setPassword] = useState({
    old: '',
    new: '',
    err: false
  })

  const UserUpdate = () => {
    const token = localStorage.getItem('token')
    userCheck(token, (user) => {
      if (user.status) {
        setProfile(profile => ({
          ...profile,
          name: user.name,
          countryCode: user.countryCode || '+91',
          country: user.country || 'India',
          number: user.number,
          email: user.email,
          password: '',
          pass4email: ''
        }))
        setUserLogged(user)
      }
    })
  }

  const handleProfileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('userId', userLogged._id)

      userAxios((server) => {
        server.post('/users/uploadProfileImage', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          if (res.data.status) {
            UserUpdate()
            toast.success("Profile Updated")
          }
        }).catch(() => {
          toast.error("Upload Failed")
        })
      })
    }
  }

  const changeInfo = (e) => {
    e.preventDefault()
    userAxios((server) => {
      server.put('/users/changeUserInfo', {
        name: profile.name,
        country: profile.country,
        countryCode: profile.countryCode,
        number: profile.number,
        password: profile.password,
        email: userLogged.email,
      }).then((res) => {
        if (res.data.login) {
          localStorage.removeItem('token')
          setUserLogged({ status: false })
        } else {
          if (res.data) {
            UserUpdate()
            toast.success("Done")
          } else {
            toast.error("Entered Password Wrong")
          }
        }
      }).catch(() => {
        toast.error("Sorry for error")
      })
    })
  }

  const changeEmail = (e) => {
    e.preventDefault()
    userAxios((server) => {
      server.put('/users/changeEmail', {
        password: profile.pass4email,
        email: userLogged.email,
        newEmail: profile.email
      }).then((res) => {
        if (res.data.login) {
          localStorage.removeItem('token')
          setUserLogged({ status: false })
        } else {
          if (res.data.done) {
            UserUpdate()
            toast.success("Done")
          } else if (res.data.already) {
            toast.success("Email Already Used")
          } else if (res.data.pass) {
            toast.error("Wrong Password")
          }
        }
      }).catch(() => {
        toast.error("Sorry for error")
      })
    })
  }

  const changePassword = (e) => {
    e.preventDefault()

    userAxios((server) => {
      if (password.new.length >= 8) {
        server.put('/users/changePassword', {
          newPass: password.new,
          email: userLogged.email,
          currPass: password.old
        }).then((res) => {
          if (res.data.login) {
            localStorage.removeItem('token')
            setUserLogged({ status: false })
          } else {
            if (res.data) {
              UserUpdate()
              setPassword({
                ...password,
                new: '',
                old: ''
              })
              toast.success("Done")
            } else {
              toast.error("Wrong Password")
            }
          }
        }).catch(() => {
          toast.error("Sorry for error")
        })
      }
    })
  }

  return (
    <div className='AccountComp'>
      <div className="container container-fluid pt-5 pb-5">

        <div>
          <div className='pb-4 MobNon'>
            <h3 className='UserBlackMain font-bold'>Account settings</h3>
            <p className='text-muted mb-0'>Manage your profile, email and security settings</p>
          </div>

          <div className="row">

            <div className="col-12 col-md-3">
              <div className="Menu">

                <div className='BtnDiv'>
                  <button className='active'>
                    <span><UserIcon color={'#ffffff'} /></span>
                    <span className='span2'>My Details</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button onClick={() => navigate.push('/address')}>
                    <span><LocationIcon color={'#1A3C5E'} /></span>
                    <span className='span2'>My Address</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button onClick={() => navigate.push('/orders')}>
                    <span><TruckIcon color={'#1A3C5E'} /></span>
                    <span className='span2'>My Orders</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button onClick={() => navigate.push('/wishlist')}>
                    <span><HeartIcon color={'#1A3C5E'} /></span>
                    <span className='span2'>My Wishlist</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button onClick={() => navigate.push('/cart')}>
                    <span><CartIcon color={'#1A3C5E'} /></span>
                    <span className='span2'>My Cart</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button onClick={() => {
                    localStorage.removeItem('token')
                    setUserLogged({ status: false })
                    navigate.push('/')
                  }}>
                    <span><LogoutIcon color={'#1A3C5E'} /></span>
                    <span className='span2'>Logout</span>
                  </button>
                </div>

              </div>
            </div>

            <div className="col-12 col-md-9">
              <div className="MainCard">
                <div className='pb-3'>
                  <h4 className='UserBlackMain font-bold'>Profile details</h4>
                </div>

                <div className="row">

                  <div className="col-12">
                    <div className="SubTitle">
                      <h6 className='UserBlackMain font-bold text-small'>Personal Information</h6>
                    </div>

                    <div className='pt-3'>

                      <div className="row">
                        <div className="col-12 MobNon col-md-4">
                          <h6 className='text-small UserGrayMain'>A user profile is a collection of settings and information associated with a user. It contains critical information that is used to identify an individual.</h6>
                        </div>

                        <div className="col-12 col-md-8">

                          <div className="row">
                            <div className='col-12 pb-5'>
                              <div className='d-flex align-items-center gap-4 bg-light p-4 rounded-4 shadow-sm border'>
                                <div style={{
                                  width: 90, height: 90, borderRadius: '50%',
                                  overflow: 'hidden', background: '#F1F5F9',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }}>
                                  {userLogged.profileImage ? (
                                    <img src={`${ServerId}/user/${userLogged._id}/${userLogged.profileImage}`}
                                      alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <i className="fa-solid fa-user fa-3x text-light-blue" style={{ color: '#94A3B8' }}></i>
                                  )}
                                </div>
                                <div>
                                  <label htmlFor="profileUpload" className='btn btn-navy btn-lg mb-0 px-4 d-flex align-items-center gap-2' style={{ cursor: 'pointer', fontSize: '14px' }}>
                                    <i className="fa-solid fa-camera"></i>
                                    Update Profile Photo
                                  </label>
                                  <input type="file" id="profileUpload" hidden accept='image/*' onChange={handleProfileUpload} />
                                  <p className='text-xs text-muted mt-2 mb-0' style={{ fontSize: '12px' }}>Supported formats: JPG, PNG, GIF. Maximum 2MB size.</p>
                                </div>
                              </div>
                            </div>

                            <form onSubmit={changeInfo} className='row g-4'>
                              <div className="col-12">
                                <label className='form-label mb-2'>COUNTRY</label>
                                <select className='input-field px-3' value={profile.country} onChange={(e) => {
                                  const c = Countries.find(x => x.name === e.target.value);
                                  setProfile({ ...profile, country: e.target.value, countryCode: c?.code || '+91' })
                                }} required>
                                  {Countries.map((c, i) => (
                                    <option key={i} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>FULL NAME</label>
                                <input className='input-field' value={profile.name} onInput={(e) => {
                                  setProfile({ ...profile, name: e.target.value })
                                }} placeholder='Enter your full name' type="text" required />
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>PHONE NUMBER</label>
                                <div className='d-flex gap-3'>
                                  <select className='input-field px-2' style={{ width: '100px', flexShrink: 0 }} value={profile.countryCode} onChange={(e) => {
                                    setProfile({ ...profile, countryCode: e.target.value })
                                  }}>
                                    {Countries.map((c, i) => (
                                      <option key={i} value={c.code}>{c.code}</option>
                                    ))}
                                  </select>
                                  <input className='input-field flex-grow-1' value={profile.number} onInput={(e) => {
                                    setProfile({ ...profile, number: e.target.value })
                                  }} placeholder='Phone Number' type="number" required />
                                </div>
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>VERIFY PASSWORD</label>
                                <input className='input-field' value={profile.password} onInput={(e) => {
                                  setProfile({ ...profile, password: e.target.value })
                                }} type="password" placeholder='Confirm changes with your password' required />
                              </div>

                              <div className="col-12 pt-3">
                                <button type="submit" className='btn btn-navy px-5 shadow-navy w-100 py-3'>SAVE PROFILE CHANGES</button>
                              </div>
                            </form>

                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                  <div className="col-12 pt-4">
                    <div className="SubTitle">
                      <h6 className='UserBlackMain font-bold text-small'>E-mail address</h6>
                    </div>

                    <div className='pt-3'>

                      <div className="row">
                        <div className="col-12 col-md-4 MobNon">
                          <h6 className='text-small UserGrayMain'>A user profile is a collection of settings and information associated with a user. It contains critical information that is used to identify an individual.</h6>
                        </div>

                        <div className="col-12 col-md-8">

                          <div className="row">

                            <form onSubmit={changeEmail} className='row g-4'>
                              <div className="col-12">
                                <label className='form-label mb-2'>NEW E-MAIL ADDRESS</label>
                                <input className='input-field' value={profile.email} onInput={(e) => {
                                  setProfile({ ...profile, email: e.target.value })
                                }} placeholder='Ex: user@example.com' type="email" required />
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>CURRENT PASSWORD</label>
                                <input className='input-field' value={profile.pass4email} onInput={(e) => {
                                  setProfile({ ...profile, pass4email: e.target.value })
                                }} type="password" placeholder='Enter password for verification' required />
                              </div>

                              <div className="col-12 pt-3">
                                <button type="submit" className='btn btn-navy px-5 w-100 py-3'>UPDATE EMAIL</button>
                              </div>
                            </form>

                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                  <div className="col-12 pt-4">
                    <div className="SubTitle">
                      <h6 className='UserBlackMain font-bold text-small'>Security</h6>
                    </div>

                    <div className='pt-3'>

                      <div className="row">
                        <div className="col-12 col-md-4 MobNon">
                          <h6 className='text-small UserGrayMain'>Passwords provide the first line of defense against unauthorized access to your account.</h6>
                        </div>

                        <div className="col-12 col-md-8">

                          <div className="row">

                            <form onSubmit={changePassword} className='row g-4'>
                              <div className="col-12">
                                <label className='form-label mb-2'>NEW PASSWORD</label>
                                <input className='input-field' value={password.new} onInput={(e) => {
                                  if (e.target.value.length < 8 && e.target.value.length !== 0) {
                                    setPassword({ ...password, err: true, new: e.target.value })
                                  } else {
                                    setPassword({ ...password, err: false, new: e.target.value })
                                  }
                                }} placeholder='Minimum 8 characters' type="password" required />
                                {password.err && (
                                  <label className='text-xs mt-2 d-block' style={{ color: '#DC2626', fontSize: '11px' }}>Password must be at least 8 characters</label>
                                )}
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>CURRENT PASSWORD</label>
                                <input className='input-field' value={password.old} onInput={(e) => {
                                  setPassword({ ...password, old: e.target.value })
                                }} type="password" placeholder='Confirm with current password' required />
                              </div>

                              <div className="col-12 pt-3">
                                <button type="submit" className='btn btn-navy px-5 w-100 py-3'>UPDATE PASSWORD</button>
                              </div>
                            </form>

                          </div>

                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default AccountComp