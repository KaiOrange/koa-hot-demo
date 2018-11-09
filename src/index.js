import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Index extends React.Component {
  constructor() {
    super();
    this.state = { someKey: 'someValue' };
  }

  render() {
    return <p>{this.state.someKey}</p>;
  }

  componentDidMount() {
    this.setState({ someKey: 'otherValue' });
  }
}

ReactDOM.render( <Index/>,document.querySelector("#main"));

//开启热替换
if (module.hot) {
  module.hot.accept();
}