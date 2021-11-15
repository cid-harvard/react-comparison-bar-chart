import React from 'react';
import BostonNewYork3Digit from './components/BostonNewYork3Digit';
import BostonAracaju6Digit from './components/BostonAracaju6Digit';
import BostonAracaju2Digit from './components/BostonAracaju2Digit';
import BostonAracaju1Digit from './components/BostonAracaju1Digit';
import BostonAracajuServicesOnly from './components/BostonAracajuServicesOnly';
import RCAComparison from './components/RCAComparison';
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
        <Route exact path={'/2-digit'} component={BostonAracaju2Digit} />
        <Route exact path={'/1-digit'} component={BostonAracaju1Digit} />
        <Route exact path={'/rca'} component={RCAComparison} />
        <Route exact path={'/services-only'} component={BostonAracajuServicesOnly} />
        <Route component={BostonNewYork3Digit} />
      </Switch>
    </HashRouter>
  )
}

export default App;
