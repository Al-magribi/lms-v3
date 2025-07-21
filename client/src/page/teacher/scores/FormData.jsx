import React from "react";
import ReactSelect from "react-select";

const FormData = ({ student }) => {
  return (
    <div
      className="modal fade"
      id="score"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Input Nilai</h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">sdasd</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Tutup
            </button>
            <button type="button" className="btn btn-primary">
              <i className="bi bi-save"></i>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormData;
