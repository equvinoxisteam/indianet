import UserIcon from '../../../Assets/UserIcon'
import LocationIcon from '../../../Assets/LocationIcon'
import LogoutIcon from '../../../Assets/logoutIcon'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import { userAxios, userCheck, ServerId } from '../../../Config/Server'
import toast from 'react-hot-toast'
import { Countries } from '../../../Config/GlobalData'

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024

function AccountComp() {
  const navigate = useRouter()
  const { userLogged, setUserLogged } = useContext(ContentControl)

  const [profile, setProfile] = useState({
    name: userLogged.name || '',
    countryCode: userLogged.countryCode || '+91',
    country: userLogged.country || 'India',
    number: userLogged.number || '',
    password: '',
  })

  const [newEmail, setNewEmail] = useState(userLogged.email || '')
  const [pass4email, setPass4email] = useState('')

  const [password, setPassword] = useState({
    old: '',
    new: '',
    err: false,
  })

  useEffect(() => {
    if (!userLogged.status) return
    setProfile((p) => ({
      ...p,
      name: userLogged.name || '',
      countryCode: userLogged.countryCode || '+91',
      country: userLogged.country || 'India',
      number: userLogged.number || '',
    }))
    setNewEmail(userLogged.email || '')
  }, [userLogged.status, userLogged._id, userLogged.name, userLogged.email, userLogged.number, userLogged.country, userLogged.countryCode])

  const UserUpdate = () => {
    const token = localStorage.getItem('token')
    userCheck(token, (user) => {
      if (user.status) {
        setProfile((p) => ({
          ...p,
          name: user.name,
          countryCode: user.countryCode || '+91',
          country: user.country || 'India',
          number: user.number,
          password: '',
        }))
        setNewEmail(user.email)
        setPass4email('')
        setUserLogged(user)
      }
    })
  }

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!/^image\/(jpeg|jpg|png|gif)$/i.test(file.type)) {
      toast.error('Use JPG, PNG, or GIF only')
      return
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      toast.error('Image must be 2MB or smaller')
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('userId', userLogged._id)

    userAxios((server) => {
      server.post('/users/uploadProfileImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((res) => {
        if (res.data.login) {
          localStorage.removeItem('token')
          setUserLogged({ status: false })
          toast.error('Please sign in again')
        } else if (res.data.status) {
          UserUpdate()
          toast.success('Profile photo uploaded')
        } else {
          toast.error(res.data.message === 'invalid_image_type' ? 'Invalid image type' : 'Upload failed')
        }
      }).catch(() => {
        toast.error('Upload failed — check file size (max 2MB)')
      })
    })
  }

  const changeInfo = (e) => {
    e.preventDefault()
    userAxios((server) => {
      server.put('/users/changeUserInfo', {
        name: profile.name.trim(),
        country: profile.country,
        countryCode: profile.countryCode,
        number: profile.number,
        password: profile.password,
        email: userLogged.email,
      }).then((res) => {
        if (res.data.login) {
          localStorage.removeItem('token')
          setUserLogged({ status: false })
        } else if (res.data) {
          UserUpdate()
          toast.success('Profile updated')
        } else {
          toast.error('Incorrect password')
        }
      }).catch(() => {
        toast.error('Could not update profile')
      })
    })
  }

  const changeEmail = (e) => {
    e.preventDefault()
    if (newEmail.trim().toLowerCase() === userLogged.email?.toLowerCase()) {
      toast.error('Enter a different email address')
      return
    }
    userAxios((server) => {
      server.put('/users/changeEmail', {
        password: pass4email,
        email: userLogged.email,
        newEmail: newEmail.trim().toLowerCase(),
      }).then((res) => {
        if (res.data.login) {
          localStorage.removeItem('token')
          setUserLogged({ status: false })
        } else if (res.data.done) {
          UserUpdate()
          toast.success('Email updated')
        } else if (res.data.already) {
          toast.error('Email already in use')
        } else if (res.data.pass) {
          toast.error('Incorrect password')
        } else {
          toast.error('Could not update email')
        }
      }).catch(() => {
        toast.error('Could not update email')
      })
    })
  }

  const changePassword = (e) => {
    e.preventDefault()
    if (password.new.length < 8) {
      setPassword({ ...password, err: true })
      toast.error('Password must be at least 8 characters')
      return
    }
    userAxios((server) => {
      server.put('/users/changePassword', {
        newPass: password.new,
        email: userLogged.email,
        currPass: password.old,
      }).then((res) => {
        if (res.data.login) {
          localStorage.removeItem('token')
          setUserLogged({ status: false })
        } else if (res.data) {
          setPassword({ old: '', new: '', err: false })
          toast.success('Password updated')
        } else {
          toast.error('Incorrect current password')
        }
      }).catch(() => {
        toast.error('Could not update password')
      })
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
                  <button type="button" className='active'>
                    <span><UserIcon color={'#ffffff'} /></span>
                    <span className='span2'>My Details</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button type="button" onClick={() => navigate.push('/address')}>
                    <span><LocationIcon color={'#1A3C5E'} /></span>
                    <span className='span2'>My Address</span>
                  </button>
                </div>

                <div className='BtnDiv'>
                  <button type="button" onClick={() => {
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
                                  border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                }}>
                                  {userLogged.profileImage ? (
                                    <img
                                      src={`${ServerId}/user/${userLogged._id}/${userLogged.profileImage}`}
                                      alt="Profile"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <i className="fa-solid fa-user fa-3x" style={{ color: '#94A3B8' }} />
                                  )}
                                </div>
                                <div>
                                  <label htmlFor="profileUpload" className='btn btn-navy btn-lg mb-0 px-4 d-flex align-items-center gap-2' style={{ cursor: 'pointer', fontSize: '14px' }}>
                                    <i className="fa-solid fa-cloud-arrow-up" />
                                    Upload
                                  </label>
                                  <input type="file" id="profileUpload" hidden accept='image/jpeg,image/jpg,image/png,image/gif' onChange={handleProfileUpload} />
                                  <p className='text-xs text-muted mt-2 mb-0' style={{ fontSize: '12px' }}>Supported formats: JPG, PNG, GIF. Maximum 2MB size.</p>
                                </div>
                              </div>
                            </div>

                            <form onSubmit={changeInfo} className='row g-4'>
                              <div className="col-12">
                                <label className='form-label mb-2'>COUNTRY</label>
                                <select className='input-field px-3' value={profile.country} onChange={(e) => {
                                  const c = Countries.find((x) => x.name === e.target.value)
                                  setProfile({ ...profile, country: e.target.value, countryCode: c?.code || '+91' })
                                }} required>
                                  {Countries.map((c, i) => (
                                    <option key={i} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>FULL NAME</label>
                                <input
                                  className='input-field'
                                  value={profile.name}
                                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                  placeholder='Enter your full name'
                                  type="text"
                                  required
                                />
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>PHONE NUMBER</label>
                                <div className='d-flex gap-3'>
                                  <select
                                    className='input-field px-2'
                                    style={{ width: '100px', flexShrink: 0 }}
                                    value={profile.countryCode}
                                    onChange={(e) => setProfile({ ...profile, countryCode: e.target.value })}
                                  >
                                    {Countries.map((c, i) => (
                                      <option key={i} value={c.code}>{c.code}</option>
                                    ))}
                                  </select>
                                  <input
                                    className='input-field flex-grow-1'
                                    value={profile.number}
                                    onChange={(e) => setProfile({ ...profile, number: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                                    placeholder='Phone Number'
                                    type="tel"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="col-12">
                                <label className='form-label mb-2'>VERIFY PASSWORD</label>
                                <input
                                  className='input-field'
                                  value={profile.password}
                                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                  type="password"
                                  placeholder='Confirm changes with your password'
                                  required
                                />
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
                          <form onSubmit={changeEmail} className='row g-4'>
                            <div className="col-12">
                              <label className='form-label mb-2'>NEW E-MAIL ADDRESS</label>
                              <input
                                className='input-field'
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder='Ex: user@example.com'
                                type="email"
                                required
                              />
                            </div>

                            <div className="col-12">
                              <label className='form-label mb-2'>CURRENT PASSWORD</label>
                              <input
                                className='input-field'
                                value={pass4email}
                                onChange={(e) => setPass4email(e.target.value)}
                                type="password"
                                placeholder='Enter password for verification'
                                required
                              />
                            </div>

                            <div className="col-12 pt-3">
                              <button type="submit" className='btn btn-navy px-5 w-100 py-3'>UPDATE EMAIL</button>
                            </div>
                          </form>
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
                          <form onSubmit={changePassword} className='row g-4'>
                            <div className="col-12">
                              <label className='form-label mb-2'>NEW PASSWORD</label>
                              <input
                                className='input-field'
                                value={password.new}
                                onChange={(e) => {
                                  const v = e.target.value
                                  setPassword({ ...password, err: v.length > 0 && v.length < 8, new: v })
                                }}
                                placeholder='Minimum 8 characters'
                                type="password"
                                required
                                minLength={8}
                              />
                              {password.err && (
                                <label className='text-xs mt-2 d-block' style={{ color: '#DC2626', fontSize: '11px' }}>Password must be at least 8 characters</label>
                              )}
                            </div>

                            <div className="col-12">
                              <label className='form-label mb-2'>CURRENT PASSWORD</label>
                              <input
                                className='input-field'
                                value={password.old}
                                onChange={(e) => setPassword({ ...password, old: e.target.value })}
                                type="password"
                                placeholder='Confirm with current password'
                                required
                              />
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
  )
}

export default AccountComp
