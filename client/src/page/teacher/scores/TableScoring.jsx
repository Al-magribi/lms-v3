import React from "react";
import { useSearchParams } from "react-router-dom";

const TableScoring = () => {
  const [searchParams] = useSearchParams();
  const subjectid = searchParams.get("id");
  const chapterid = searchParams.get("chapterid");
  const classid = searchParams.get("classid");
  const month = searchParams.get("month");

  return <div className="mt-3">TableScoring</div>;
};

export default TableScoring;
