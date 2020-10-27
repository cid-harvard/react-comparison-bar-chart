import React from 'react';
import BostonNewYork3Digit from './components/BostonNewYork3Digit';
import BostonAracaju6Digit from './components/BostonAracaju6Digit';
import {
  Route,
  Switch,
  HashRouter,
} from 'react-router-dom';

const App = () => {

  return (
    <HashRouter>
      <Switch>
        <Route exact path={'/3-digit'} component={BostonNewYork3Digit} />
        <Route exact path={'/6-digit'} component={BostonAracaju6Digit} />
        <Route component={BostonNewYork3Digit} />
      </Switch>
    </HashRouter>
  )
}

export default App;
