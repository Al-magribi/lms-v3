import React, { useState } from "react";
import Form from "./Form";
import TableBank from "./TableBank";

const CbtBank = () => {
  const [detail, setDetail] = useState("");
  return (
    <div className="container-fluid">
      <Form detail={detail} setDetail={setDetail} />

      <TableBank setDetail={setDetail} />
    </div>
  );
};

export default CbtBank;
