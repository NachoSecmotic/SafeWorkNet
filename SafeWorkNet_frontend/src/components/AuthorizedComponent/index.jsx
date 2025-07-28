import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AuthorizedComponent({ component }) {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  return isLoggedIn
    ? component
    : <Navigate to="/notFound" />;
}

export default AuthorizedComponent;
