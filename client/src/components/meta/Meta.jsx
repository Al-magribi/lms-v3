import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

const Meta = ({ title, desc }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{`LMS | ${title}`}</title>
        <meta name="description" content={desc} />
      </Helmet>
    </HelmetProvider>
  );
};

export default Meta;
