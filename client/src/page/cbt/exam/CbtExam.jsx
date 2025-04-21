import { useState } from "react";
import Form from "./Form";
import Modal from "./Modal";
import TableExam from "./TableExam";

const CbtExam = () => {
  const [detail, setDetail] = useState(null);

  const handleEdit = (exam) => {
    setDetail(exam);
  };

  return (
    <div className='row g-2'>
      <div className='col-12'>
        <div className='d-flex justify-content-end mb-1'>
          <button
            className='btn btn-sm btn-primary'
            data-bs-toggle='modal'
            data-bs-target='#addexam'>
            <i className='bi bi-plus-lg me-2'></i>
            Tambah Ujian
          </button>
        </div>
        <TableExam setDetail={handleEdit} />
      </div>

      <Modal detail={detail}>
        <Form detail={detail} setDetail={setDetail} />
      </Modal>
    </div>
  );
};

export default CbtExam;
