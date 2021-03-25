import React from "react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import { store } from "./redux/store";

import Home from "./views/Home";
import ImageInput from "./views/ImageInput";
import TrainWithVideo from "./views/TrainWithVideo";
import VideoInput from "./views/VideoInput";

// const history = createBrowserHistory();
const App = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <div className="route">
            <Route exact path="/" component={Home} />
            <Route exact path="/photo" component={ImageInput} />
            <Route exact path="/camera" component={VideoInput} />
            <Route exact path="/train" component={TrainWithVideo} />
          </div>
        </Router>
      </div>
    </Provider>
  );
};

export default App;
