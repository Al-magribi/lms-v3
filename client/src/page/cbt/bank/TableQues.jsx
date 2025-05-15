import { useState } from "react";
import {
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
} from "../../../controller/api/cbt/ApiBank";
import Table from "../../../components/table/Table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const createMarkup = (html) => {
  return { __html: html };
};

const TableQues = ({ subject, name, bankid }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {}, isLoading: dataLoading } = useGetQuestionsQuery({
    page,
    limit,
    search,
    bankid: bankid,
  });
  const { totalData, totalPages, questions = [] } = rawData;

  const [deleteQuestion, { isLoading }] = useDeleteQuestionMutation();

  const deleteHandler = (id) => {
    toast.promise(
      deleteQuestion(id)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memproses...",
        success: (message) => message,
        error: (err) => err.data.message,
      }
    );
  };

  const goToLink = (questionid) => {
    const nameFormat = name.replace(/[\s/]/g, "-");
    const subjectFormat = subject.replace(/[\s/]/g, "-");
    navigate(
      `/admin-cbt-bank/${subjectFormat}/${nameFormat}/${bankid}/${questionid}/edit-soal`
    );
  };

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
        {questions?.length > 0 ? (
          questions?.map((item, index) => (
            <div key={item.id} className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <span className="badge bg-primary me-3">
                        {(page - 1) * limit + index + 1}
                      </span>
                      <span
                        className={`badge ${
                          item.qtype == 1 ? "bg-success" : "bg-info"
                        }`}
                      >
                        {item.qtype == 1 ? "PG" : "Essay"}
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => goToLink(item.id)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={isLoading}
                        onClick={() => deleteHandler(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block mb-2">
                      Pertanyaan
                    </small>
                    <div
                      className="border rounded p-3 bg-light"
                      dangerouslySetInnerHTML={createMarkup(item.question)}
                    />
                  </div>

                  {item.qtype == 1 && (
                    <div className="row g-3 mb-3">
                      {["a", "b", "c", "d", "e"].map(
                        (option) =>
                          item[option] &&
                          item[option].trim() !== "" && (
                            <div key={option} className="col-md-6 col-lg-4">
                              <div className="d-flex align-items-start">
                                <span className="badge bg-secondary me-2 mt-1">
                                  {option.toUpperCase()}
                                </span>
                                <div
                                  className={`border rounded p-2 flex-grow-1 ${
                                    item.qkey === option
                                      ? "bg-success bg-opacity-10"
                                      : ""
                                  }`}
                                  dangerouslySetInnerHTML={createMarkup(
                                    item[option]
                                  )}
                                />
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-3 pt-3 border-top">
                    <div>
                      <small className="text-muted d-block">Jawaban</small>
                      <span className="badge bg-success">{item.qkey}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block">Poin</small>
                      <span className="badge bg-primary">{item.poin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info mb-0">Data belum tersedia</div>
          </div>
        )}
      </div>
    </Table>
  );
};

export default TableQues;
