import React from "react";
import { Spinner } from "react-bootstrap";
import "./loader-small.scss";

interface LoaderSmallProps {
  style?: React.CSSProperties;
}

const LoaderSmall: React.FC<LoaderSmallProps> = ({ style }) => {
  return (
    <div className="spinner-container" style={style}>
      <Spinner animation="border" role="status" />
    </div>
  );
};

export default LoaderSmall;
