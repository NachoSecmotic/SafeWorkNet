import React, { createContext, useState, useMemo } from 'react';

const ConnecctionCtxt = createContext();

function ConnectionProvider({ children }) {
  const [showMap, setShowMap] = useState(true);

  const objectValue = useMemo(() => ({ map: { state: showMap, setShowMap } }), [showMap]);

  return (
    <ConnecctionCtxt.Provider value={objectValue}>
      {children}
    </ConnecctionCtxt.Provider>
  );
}

export { ConnecctionCtxt };
export default ConnectionProvider;
