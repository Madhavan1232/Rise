import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function Avatar({ user, large = false }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatar_url || user?.avatar || user?.avatarUrl;
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : 'U';

  const showImage = Boolean(avatarUrl && !imgError);

  return (
    <div className={large ? 'user-btn__avatar--large' : 'user-btn__avatar'}>
      {showImage ? (
        <img
          src={avatarUrl}
          alt={user?.name || 'User avatar'}
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function MenuItem({ children, onClick }) {
  return (
    <button type="button" className="user-btn__menu-item" onClick={onClick}>
      {children}
    </button>
  );
}

export default function UserButton({ user, onSignOut, onSettings }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="user-btn__root" ref={rootRef}>
      {/* Anchor Trigger Button: stays mounted & stable */}
      <button
        type="button"
        className={`user-btn__trigger${open ? ' active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar user={user} />
      </button>

      {/* Smooth, anchored dropdown popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="user-dropdown-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top right' }}
            className="user-btn__dropdown absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 z-50"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User profile header */}
            <div className="user-btn__menu-header">
              <Avatar user={user} large />
              <div className="user-btn__menu-header-content">
                <p className="user-btn__name" title={displayName}>
                  {displayName}
                </p>
                {displayEmail && (
                  <p className="user-btn__email" title={displayEmail}>
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="user-btn__menu-content">
              <MenuItem
                onClick={() => {
                  setOpen(false);
                  onSettings?.();
                }}
              >
                <svg
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.559 2.536A.667.667 0 0 1 7.212 2h1.574a.667.667 0 0 1 .653.536l.22 1.101c.466.178.9.429 1.287.744l1.065-.36a.667.667 0 0 1 .79.298l.787 1.362a.666.666 0 0 1-.136.834l-.845.742c.079.492.079.994 0 1.486l.845.742a.666.666 0 0 1 .137.833l-.787 1.363a.667.667 0 0 1-.791.298l-1.065-.36c-.386.315-.82.566-1.286.744l-.22 1.101a.666.666 0 0 1-.654.536H7.212a.666.666 0 0 1-.653-.536l-.22-1.101a4.664 4.664 0 0 1-1.287-.744l-1.065.36a.666.666 0 0 1-.79-.298L2.41 10.32a.667.667 0 0 1 .136-.834l.845-.743a4.7 4.7 0 0 1 0-1.485l-.845-.742a.667.667 0 0 1-.137-.833l.787-1.363a.667.667 0 0 1 .791-.298l1.065.36c.387-.315.821-.566 1.287-.744l.22-1.101ZM7.999 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                  />
                </svg>
                Settings
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setOpen(false);
                  onSignOut?.();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.6 2.604A2.045 2.045 0 0 1 4.052 2h3.417c.544 0 1.066.217 1.45.604.385.387.601.911.601 1.458v.69c0 .413-.334.75-.746.75a.748.748 0 0 1-.745-.75v-.69a.564.564 0 0 0-.56-.562H4.051a.558.558 0 0 0-.56.563v7.875a.564.564 0 0 0 .56.562h3.417a.558.558 0 0 0 .56-.563v-.671c0-.415.333-.75.745-.75s.746.335.746.75v.671c0 .548-.216 1.072-.6 1.459a2.045 2.045 0 0 1-1.45.604H4.05a2.045 2.045 0 0 1-1.45-.604A2.068 2.068 0 0 1 2 11.937V4.064c0-.548.216-1.072.6-1.459Zm8.386 3.116a.743.743 0 0 1 1.055 0l1.74 1.75a.753.753 0 0 1 0 1.06l-1.74 1.75a.743.743 0 0 1-1.055 0 .753.753 0 0 1 0-1.06l.467-.47H5.858A.748.748 0 0 1 5.112 8c0-.414.334-.75.746-.75h5.595l-.467-.47a.753.753 0 0 1 0-1.06Z"
                  />
                </svg>
                Log out
              </MenuItem>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
