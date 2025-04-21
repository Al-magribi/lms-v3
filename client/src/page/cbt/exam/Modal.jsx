import { useEffect } from "react";

const Modal = ({ children, detail }) => {
  useEffect(() => {
    // Cleanup function to reset body overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className='modal fade'
      id='addexam'
      data-bs-backdrop='static'
      data-bs-keyboard='false'
      tabIndex='-1'
      aria-labelledby='staticBackdropLabel'
      aria-hidden='true'>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-5' id='staticBackdropLabel'>
              {detail?.id ? "Edit Ujian" : "Tambah Ujian"}
            </h1>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'></button>
          </div>
          <div className='modal-body'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
