import React from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
// require normalized overrides
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';
import enUS from 'antd/es/locale/en_US';
import Routes from './routes';
import store from './services/redux/store';
import messages from './locale/translations/index';

function App() {
  const browserLanguage = navigator.language || navigator.userLanguage;
  let antdLocale = enUS;

  if (browserLanguage.startsWith('es')) {
    antdLocale = esES;
  }

  return (
    <ConfigProvider locale={antdLocale}>
      <Provider store={store}>
        <IntlProvider locale={navigator.language} messages={messages(navigator.language)}>
          <Routes />
        </IntlProvider>
      </Provider>
    </ConfigProvider>

  );
}

export default App;
