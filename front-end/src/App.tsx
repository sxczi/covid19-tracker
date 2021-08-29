import React from 'react';
import './App.css';

interface CovidData {
  confirmed: string,
  current: string,
  new: string,
  recovered: string,
  deaths: string,
  asOf: string
}

class App extends React.Component<{}, CovidData> {
  constructor(props: {}) {
    super(props);
    this.state = {
      confirmed: 'Loading..',
      current: 'Loading..',
      new: 'Loading..',
      recovered: 'Loading..',
      deaths: 'Loading..',
      asOf: new Date().toDateString()
    }
  }

  componentDidMount() {
    fetch('/covid')
      .then(res => res.json())
      .then(res => this.setState({
        confirmed: res.confirmed,
        current: res.current,
        new: res.new,
        recovered: res.recovered,
        deaths: res.deaths,
        asOf: res.asOf
      }))
      .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="app">
        <header>
          <h1>COVID-19 situation in Kurdistan</h1>
          <p>As of: {this.state.asOf}</p>
        </header>
        <main>
          <div className="card">
            <h2>Confirmed</h2>
            <p>{this.state.confirmed}</p>
          </div>
          <div className="card">
            <h2>Current</h2>
            <p>{this.state.current}</p>
          </div>
          <div className="card">
            <h2>New</h2>
            <p>{this.state.new}</p>
          </div>
          <div className="card">
            <h2>Recovered</h2>
            <p>{this.state.recovered}</p>
          </div>
          <div className="card bottom">
            <h2>Deaths</h2>
            <p>{this.state.deaths}</p>
          </div>
        </main>
        <footer>
          <p>Made by <a href="https://github.com/uwuxia" target="_blank" rel="noreferrer">@uwuxia</a></p>
          <p>Data from <a href="https://gov.krd/coronavirus-en/dashboard/" target="_blank" rel="noreferrer">gov.krd</a></p>
        </footer>
      </div>
    )
  }
}

export default App;