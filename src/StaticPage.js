import React from "react";

const StaticPage = ({ val, link }) => {
  return (
    <div className="">
      <header className="">
        <div className="">
          <p className="inside-text">
            Click here to make the <code>Payment</code>
          </p>
          <a
            href={link}
            className="btn btn-outline-success"
            target="_blank"
            rel="noreferrer"
            style={{
              padding:'10px 20px',
              fontSize:'20px',
              fontWeight:'500',
            }}
          >
            {`${val}`}
          </a>
        </div>
      </header>
    </div>
  );
};

export default StaticPage;
