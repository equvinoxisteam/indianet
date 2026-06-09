import React from 'react'
import { useEffect, useContext, useRef } from 'react'
import Link from 'next/link'
import ContentControl from '../../../ContentControl/ContentControl'
import BrandLogo from '@/Component/Common/BrandLogo'
import { ServerId } from '@/Config/Server'

function MenuBar({ menuBar, setMenuBar }) {
    const { userLogged, setUserLogged,
    LoginModal, setLoginModal, allCategories } = useContext(ContentControl)

  const headerCategories = Array.isArray(allCategories) ? allCategories : []

  var modalRef = useRef()
  useEffect(() => {
    if (menuBar.btn === true) {
      setMenuBar({ ...menuBar, btn: false })
    } else {
      window.addEventListener('click', closePopUpBody);
      function closePopUpBody(event) {
        if (!modalRef.current?.contains(event.target)) {
          setMenuBar({ ...menuBar, active: false })
        }
      }
      return () => window.removeEventListener('click', closePopUpBody)
    }
  })

  return (
    <div className='MenuBar' ref={modalRef}>
      <div className='MenuContainer'>

        <div className='loginDiv'>
          <div className='avatarCircle' style={{ overflow: 'hidden', background: '#fff' }}>
            {userLogged.status && userLogged.profileImage ? (
              <img src={`${ServerId}/user/${userLogged._id}/${userLogged.profileImage}`}
                alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <i className="fa-solid fa-user" style={{ color: '#aaa' }} />
            )}
          </div>
          <div className='userInfo'>
            {userLogged.status ? (
              <div className='text-small color-white'>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Hello,</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{userLogged.name}</div>
              </div>
            ) : (
              <div className='authLinks'>
                <span onClick={() => {
                  setMenuBar({ ...menuBar, active: false, btn: false })
                  setLoginModal({ ...LoginModal, member: true, forgot: false, btn: true, active: true })
                }}>Login</span> / <span onClick={() => {
                  setMenuBar({ ...menuBar, active: false, btn: false })
                  setLoginModal({ ...LoginModal, member: false, btn: true, active: true })
                }}>Sign Up</span>
              </div>
            )}
          </div>
        </div>

        <div className='sectionOne'>
          <div className='sectionTitle'>Browse</div>
          <ul>
            <li className='ExtraPad' onClick={() => setMenuBar(prev => ({ ...prev, active: false }))}>
              <Link href={'/'} className='text-small font-bold'>
                <i className="fa-solid fa-house UserBlackMain Icons"></i>
                <span>Home</span>
              </Link>
            </li>
            <li className='ExtraPad'>
                <div 
                  className='text-small font-bold d-flex align-items-center justify-content-between pr-3' 
                  style={{ padding: '10px 12px', cursor: 'pointer' }}
                  onClick={() => setMenuBar(prev => ({ ...prev, categoryOpen: !prev.categoryOpen }))}
                >
                  <div className='d-flex align-items-center gap-3'>
                    <i className="fa-solid fa-border-all UserBlackMain Icons"></i>
                    <span>All Categories</span>
                  </div>
                  <i className={`fa-solid fa-chevron-${menuBar.categoryOpen ? 'up' : 'down'} text-muted`} style={{ fontSize: '0.8rem' }}></i>
                </div>
                
                {menuBar.categoryOpen && (
                  <ul className='categoryList'>
                    {headerCategories.length > 0 ? (
                      headerCategories.map((obj, key) => (
                        <li key={key}>
                          <Link 
                            href={`/c/${obj.slug}`} 
                            onClick={() => setMenuBar(prev => ({ ...prev, active: false }))}
                          >
                            {obj.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className='text-small text-muted py-2 px-3 text-center'>Loading categories...</li>
                    )}
                  </ul>
                )}
            </li>
          </ul>
        </div>

        <div className='sectionLast'>
          <div className='sectionTitle'>Account</div>
          <ul>
            <li className='ExtraPad'>
              <Link href={'/account'} className='text-small font-bold'>
                <i className="fa-solid fa-user-gear UserBlackMain Icons"></i>
                <span>My Account</span>
              </Link>
            </li>
            <li className='ExtraPad'>
              <Link href={'/wishlist'} className='text-small font-bold'>
                <i className="fa-regular fa-heart UserBlackMain Icons"></i>
                <span>My Wishlist</span>
              </Link>
            </li>
            <li className='ExtraPad'>
              <Link href={'/cart'} className='text-small font-bold'>
                <i className="fa-solid fa-bag-shopping UserBlackMain Icons"></i>
                <span>My Cart</span>
              </Link>
            </li>
            <li className='ExtraPad'>
              <Link href={'/orders'} className='text-small font-bold'>
                <i className="fa-solid fa-box UserBlackMain Icons"></i>
                <span>My Orders</span>
              </Link>
            </li>
            <li className='ExtraPad'>
              <Link href={'/help'} className='text-small font-bold'>
                <i className="fa-regular fa-circle-question UserBlackMain Icons"></i>
                <span>Help Center</span>
              </Link>
            </li>
            {userLogged.status && (
              <li className='LogoutPad mt-3'>
                <button
                  className='logoutBtnMobile'
                  onClick={() => {
                    localStorage.removeItem('token')
                    setUserLogged({ status: false })
                    setMenuBar({ ...menuBar, active: false })
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket mr-2"></i>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

      </div>
    </div>
  )
}

export default MenuBar