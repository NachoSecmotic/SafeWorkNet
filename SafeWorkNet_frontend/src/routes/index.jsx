import React from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter, Routes, Route, Navigate,
} from 'react-router-dom';
import AuthorizedComponent from '../components/AuthorizedComponent';
import CVSecBackground from '../components/CVSecBackground';
import CVSecTemplate from '../components/CVSecTemplate';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AImodels from '../pages/AImodels';
import Notifications from '../pages/Notifications';
import VideoStream from '../pages/VideoStream';
import EditVideoStream from '../pages/VideoStream/EditVideoStream';
import ViewNotifications from '../pages/Notifications/ViewNotifications';
import Users from '../pages/Users';
import Devices from '../pages/Devices';
import NotFound from '../pages/NotFound';
import EditNotifications from '../pages/Notifications/EditNotifications';

function Router() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <>
      <CVSecBackground />
      <BrowserRouter>
        {!isLoggedIn
          ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )
          : (
            <CVSecTemplate>
              <Routes>
                <Route
                  path="/dashboards"
                  element={
                    <AuthorizedComponent component={<Dashboard />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/users"
                  element={
                    <AuthorizedComponent component={<Users />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/devices"
                  element={
                    <AuthorizedComponent component={<Devices />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/videoStreams"
                  element={
                    <AuthorizedComponent component={<VideoStream />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/videoStreams/:id"
                  element={
                    <AuthorizedComponent component={(<EditVideoStream />)} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/aiModels"
                  element={
                    <AuthorizedComponent component={<AImodels />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <AuthorizedComponent component={<Notifications />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/notifications/:id"
                  element={
                    <AuthorizedComponent component={<ViewNotifications />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route
                  path="/notifications/edit/:id"
                  element={
                    <AuthorizedComponent component={<EditNotifications />} requiredRoles={['admin', 'user']} />
                  }
                />
                <Route path="/notFound" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/notFound" />} />
                <Route path="/login" element={<Navigate to="/dashboards" />} />
                <Route path="/" element={<Navigate to="/dashboards" />} />
              </Routes>
            </CVSecTemplate>
          )}
      </BrowserRouter>
    </>
  );
}
export default Router;
