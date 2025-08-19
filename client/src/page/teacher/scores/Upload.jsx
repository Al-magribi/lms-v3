import React from "react";

const Upload = ({ type, title, onSubmit, isLoading, inputRef, setFile }) => {
  return (
    <div
      className="modal fade"
      id="upload-score"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
    >
      <div className="modal-dialog">
        <form onSubmit={onSubmit} className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title" id="uploadScoreModalLabel">
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body d-flex flex-column gap-3">
            <div className="alert alert-info py-2 d-flex align-items-center gap-2">
              <i className="bi bi-info-circle-fill"></i>
              Upload file Excel sesuai template yang disediakan.
            </div>
            <input
              ref={inputRef}
              type="file"
              name={type}
              id={type}
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-sm btn-success"
              disabled={isLoading}
            >
              <i className="bi bi-upload me-1"></i>Upload Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
