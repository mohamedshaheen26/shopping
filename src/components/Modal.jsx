import React from "react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Save",
  closeText = "Close",
}) {
  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className='modal fade show d-block text-dark' tabIndex='-1'>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>{title}</h5>
            <button
              type='button'
              className='btn-close'
              onClick={onClose}
            ></button>
          </div>
          <div className='modal-body'>{children}</div>
          <div className='modal-footer'>
            {onConfirm && (
              <button
                type='button'
                className='btn btn-primary'
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
            <button
              type='button'
              className='btn btn-secondary'
              onClick={onClose}
            >
              {closeText}
            </button>
          </div>
        </div>
      </div>
      {/* Backdrop */}
      <div className='modal-backdrop fade show'></div>
    </div>
  );
}

export default Modal;
