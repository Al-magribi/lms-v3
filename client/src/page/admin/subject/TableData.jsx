import { useEffect, useState } from "react";
import Table from "../../../components/table/Table";
import {
  useDeleteSubjectMutation,
  useGetSubjectQuery,
} from "../../../controller/api/admin/ApiSubject";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetAppQuery } from "../../../controller/api/center/ApiApp";

const TableData = ({ setDetail }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetSubjectQuery({
    page,
    limit,
    search,
  });
  const { data: app } = useGetAppQuery();

  const { totalData, totalPages, subjects = [] } = rawData;
  const [deleteSubject, { isSuccess, isLoading, isError, reset }] =
    useDeleteSubjectMutation();

  const deleteHandler = (id) => {
    const confirm = window.confirm(
      "Apakah anda yakin ingin menghapus data mata pelajaran ini dan semua data yang terkait dengan mata pelajaran ini?"
    );
    if (confirm) {
      toast.promise(
        deleteSubject(id)
          .unwrap()
          .then((res) => res.message),
        {
          loading: "Memproses...",
          success: (message) => message,
          error: (err) => err.data.message,
        }
      );
    }
  };

  const goToLink = (name, id) => {
    const formattedName = name.replace(/\s+/g, "-");
    navigate(`/pelajaran/${formattedName}/${id}`);
  };

  useEffect(() => {
    if (isSuccess || isError) {
      reset();
    }
  }, [isSuccess, isError]);

  return (
    <Table
      page={page}
      setPage={setPage}
      setLimit={setLimit}
      setSearch={setSearch}
      totalData={totalData}
      totalPages={totalPages}
      isLoading={dataLoading}
    >
      <div className="row g-4">
        {subjects?.length > 0 ? (
          subjects?.map((subject, i) => (
            <div key={i} className="col-12 col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-primary me-3">
                          {(page - 1) * limit + i + 1}
                        </span>
                        <img
                          src={subject.cover ? subject.cover : app?.logo}
                          alt={`cover-${subject.name}`}
                          width={65}
                          height={80}
                          className="rounded"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                    <div className="col">
                      <h5 className="card-title mb-3">{subject.name}</h5>
                      <div className="d-flex flex-column gap-3">
                        {subject.teachers.map((teacher, i) => (
                          <div key={i} className="d-flex flex-column">
                            <p className="m-0 fw-medium">
                              {teacher.name}{" "}
                              <span className="text-secondary fw-normal">{`(${
                                teacher.class?.length > 0
                                  ? teacher.class
                                      ?.map((item) => item.name)
                                      .join(", ")
                                  : "Data belum tersedia"
                              })`}</span>
                            </p>
                            <div className="d-flex gap-3 text-secondary small">
                              <p className="m-0">
                                <i className="bi bi-book me-1"></i>
                                {teacher.chapters} Chapter
                              </p>
                              <p className="m-0">
                                <i className="bi bi-file-text me-1"></i>
                                {teacher.contents} Materi
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => goToLink(subject.name, subject.id)}
                        >
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => setDetail(subject)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={isLoading}
                          onClick={() => deleteHandler(subject.id)}
                        >
                          <i className="bi bi-folder-minus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info mb-0">Data tidak tersedia</div>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableData;
