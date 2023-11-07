import React from "react";

// types for the button component

const Button = (props: any) => {
  const { children, function: any } = props;

  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {children}
    </button>
  );
};

export default Button;
