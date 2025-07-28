import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';
import { Col, Input } from 'reactstrap';
import CustomButton from '../../components/CustomButton';
import { translationsCodeStatusLogin } from '../../utils/utils';
import { setCredentials } from '../../services/redux/auth/slice';
import styles from './styles.module.scss';
import { useLoginMutation } from '../../services/redux/auth/api';

const {
  containerLogin, formLogin, errorContent, errorMessageStyle,
} = styles;

function Login({ intl }) {
  const dispatch = useDispatch();
  const [login, { data: responseLogin, isError, error: apiError }] = useLoginMutation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalidInput, setInvalidInput] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isError && apiError) {
      const idLoginTranslate = translationsCodeStatusLogin(apiError.status);
      setError(intl.formatMessage({ id: idLoginTranslate }));
      setInvalidInput(true);
    }
  }, [isError, apiError, intl]);

  useEffect(() => {
    if (responseLogin) {
      if (typeof responseLogin.accessToken === 'string' && responseLogin.accessToken.trim() !== ''
      && typeof responseLogin.refreshToken === 'string' && responseLogin.refreshToken.trim() !== '') {
        dispatch(setCredentials({
          accessToken: responseLogin.accessToken,
          refreshToken: responseLogin.refreshToken,
        }));
      }
    }
  }, [dispatch, responseLogin]);

  const handleLogin = async () => {
    if (username.length === 0 || password.length === 0) {
      setError(intl.formatMessage({ id: 'login.alert' }));
      setInvalidInput(true);
      return;
    }

    setError('');
    setInvalidInput(false);

    login({ username, password });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={containerLogin}>
      <form onSubmit={handleLogin} className={formLogin}>
        <Col xs={10} sm={7} md={5} lg={4} xl={3}>
          <Input
            type="text"
            invalid={invalidInput}
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage({ id: 'login.form.placeholder.username' })}
            autoComplete="username"
          />
        </Col>
        <Col xs={10} sm={7} md={5} lg={4} xl={3}>
          <Input
            type="password"
            invalid={invalidInput}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={intl.formatMessage({ id: 'login.form.placeholder.password' })}
            autoComplete="current-password"
          />
        </Col>
        <Col className={errorContent} xs={10} sm={7} md={5} lg={5} xl={4}>
          {error && <span className={errorMessageStyle}>{error}</span>}
        </Col>
        <Col xs={10} sm={7} md={5} lg={4} xl={3}>
          <CustomButton
            className="w-100"
            onClick={() => handleLogin()}
            msg={intl.formatMessage({ id: 'login.form.submit' })}
          />
        </Col>
      </form>
    </div>
  );
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isLoggedIn,
});

export default connect(mapStateToProps)(injectIntl((Login)));
