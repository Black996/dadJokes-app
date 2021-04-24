import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./DadJoke.css";

let JOKE_API = "https://icanhazdadjoke.com/";

class DadJoke extends Component {
    static defaultProps = {
        numJokes: 10
    };

    constructor(props) {
        super(props);
        this.state = { jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), loading: false };
        this.handleNew = this.handleNew.bind(this);
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        console.log(this.seenJokes);
    };

    componentDidMount() {
        if (this.state.jokes.length === 0) this.getJokes();
    };

    handleNew() {
        this.setState({ loading: true }, this.getJokes)
    }

    async getJokes() {
        try {
            let jokes = [];
            while (jokes.length < this.props.numJokes) {
                let res = await axios.get(JOKE_API, { headers: { Accept: "application/json" } });
                let newJoke = res.data.joke;
                if (!this.seenJokes.has(newJoke)) {
                    jokes.push({ text: newJoke, id: res.data.id, votes: 0 });
                } else {
                    console.log("FOUND A DUPLICATE!");
                    console.log(res.data.joke);
                }
            };
            this.setState(st => ({ loading: false, jokes: [...st.jokes, ...jokes] }),
                () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            );
        } catch (err) {
            alert(err);
            this.setState({ loading: false });
        }
    };

    handleVote(id, delta) {
        this.setState(
            st => ({ jokes: st.jokes.map(joke => joke.id === id ? { ...joke, votes: joke.votes + delta } : joke) }),
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }

    render() {
        const jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
        if (this.state.loading) {
            return (
                <div className="DadJoke-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="Joke-title">Loading...</h1>
                </div>
            )
        }
        return (
            <div className="DadJoke">
                <div className="DadJoke-sidebar">
                    <h1 className="DadJoke-sidebar-title"><span>Dad</span> Jokes</h1>
                    <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt="Laughing face" />
                    <button className="DadJoke-sidebar-btn" onClick={this.handleNew}>New Jokes</button>
                </div>
                <ul className="DadJoke-set">
                    {jokes.map(j => <Joke
                        joke={j.text}
                        key={j.id}
                        votes={j.votes}
                        upvote={() => this.handleVote(j.id, 1)}
                        downvote={() => this.handleVote(j.id, -1)} />)}
                </ul>
            </div>
        )
    }
}

export default DadJoke;