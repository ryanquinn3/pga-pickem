import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link, 
    Switch,
    Redirect
} from 'react-router-dom';

import { Grid, Sidebar, Menu } from 'semantic-ui-react';

import { BgSegment } from './theme';

import { getUser } from './auth';

import {
    Leaderboard,
    EntryForm,
    Pool,
    SignUp,
    Login,
} from './main-panel';

import {
    SidePanel,
    BrandPanel,
} from './side-panel';

import { makeLoginRequest, makeSignUpRequest } from './api/auth';

import AuthOnly from './AuthOnly';

import MobileMenu from './MobileNav';
import { getMastersLeaderboard } from './api/golfers';
import { getPoolById, submitEntry } from './api/pools';

import './App.css';

const LeftDrawer = ({ open, onItemClicked }) => (
    <Sidebar as={Menu}
             animation='push'
             width='thin'
             visible={open}
             icon='labeled'
             vertical
             inverted>
        <Menu.Item name='pool'
                   to="/"
                   onClick={onItemClicked}
                   as={Link}>
            Pool
        </Menu.Item>
        <Menu.Item to="/leaderboard"
                   as={Link}
                   onClick={onItemClicked}
                   name='Leaderboard'>
            Leaderboard
        </Menu.Item>
        {/*<Menu.Item to="/entry"
                   as={Link}
                   onClick={onItemClicked}
                   name='Your Entry'>
            Your Entry
        </Menu.Item>*/}
    </Sidebar>
);


const MainContent = ({ 
    entrants, golfers, golfersError, 
    entrantsError, golfersById, loginError,
    onLoginSubmit, onSignUpSubmit, signUpError,
    onEntrySubmit
 }) => (
    <Grid.Column largeScreen={13}
                 computer={13}
                 className="main-content"
                 mobile={16}>
        <Switch>
            <Route exact path="/" render={
                () => <Pool entrants={entrants} error={entrantsError || golfersError }/>
            }/>
            <Route path="/leaderboard" render={
                () => <Leaderboard golfers={golfers} error={golfersError}/>
            }/>
            <Route path="/login" render={
                () => <Login error={loginError} onSubmit={onLoginSubmit} />
            } />
            <Route path="/signup" render={
                () => <SignUp error={signUpError} onSubmit={onSignUpSubmit} />
            } />
            <Route path="/entry" render={
                () => <EntryForm onSubmit={onEntrySubmit}/>
            }/>
            <Redirect to="/login"/>
        </Switch>
    </Grid.Column>
)


class App extends Component {
    state = {
        golfers: [],
        golfersById: {},
        entrants: [],
        menuOpen: false,
        golfersError: null,
        entrantsError: null,
        loginError: null,
        signUpError: null,
        user: getUser(),
    };

    toggleMenu = () => this.setState({ menuOpen: !this.state.menuOpen });
    getGolferById = (id) => this.state.golfersById[id] || { name: 'loading', id: Math.random() }

    onLogin = (formValues) => {
        return makeLoginRequest(formValues)
            .then((user) => this.setState({ user, loginError: null }))
            .catch((error) => this.setState({ loginError: error }));
    }

    onSignUp = (formValues) => {
        return makeSignUpRequest(formValues)
            .then((user) => this.setState({ user, signUpError: null }))
            .catch((error) => this.setState({ signUpError: error }));
    }
    
    onEntrySubmit = (entry) => {
        return submitEntry(entry)
            .then(() => {
                alert('Your entry was saved successfully');
            })
            .catch(() => {
                alert('An error occurred saving your entry');
            })
    }

    componentDidMount() {
        this.golfers$ = getMastersLeaderboard()
            .subscribe(
                (golfers) => {
                    const golfersById = golfers.reduce(
                        (accum, golfer) => ({ ...accum, [golfer.id]: golfer }),
                        {}
                    );
                    this.setState({ golfers, golfersById })
                },
                (golfersError) => this.setState({ golfersError })
            );

        this.entrants$ = getPoolById()
            .subscribe(
                ({ entrants }) => {
                    const updatedEntrants = entrants.map((entrant) => {
                        return {
                            ...entrant,
                            golfers: entrant.golfers.map(this.getGolferById)
                        }
                    })
                    this.setState({ entrants: updatedEntrants })
                },
                (entrantsError) => this.setState({ entrantsError })
            );
    }

    render() {
        const {
         entrants, golfers,
         golfersError, entrantsError,
         menuOpen, golfersById, loginError, signUpError, user
        } = this.state;

        if(user){
            debugger;
        }
        return (
            <Router>
                <div className="App">
                    <Sidebar.Pushable as={BgSegment}>
                        <LeftDrawer
                            open={menuOpen}
                            onItemClicked={this.toggleMenu}/>
                        <Sidebar.Pusher>
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column
                                        only="mobile tablet"
                                        width={16}>
                                        <MobileMenu onClick={this.toggleMenu}/>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column width={3} only="computer">
                                        <BrandPanel {...{ entrants, golfers }}/>
                                            <Route path="*" render={
                                                ({ match }) => <SidePanel {...{ match, entrants, golfers }}/>
                                        }/>
                                    </Grid.Column>
                                    <MainContent {...{
                                        entrants,
                                        golfers,
                                        golfersError,
                                        entrantsError,
                                        golfersById,
                                        onLoginSubmit: this.onLogin,
                                        onSignUpSubmit: this.onSignUp,
                                        loginError: loginError,
                                        signUpError: signUpError,
                                        onEntrySubmit: this.onEntrySubmit
                                    }}/>
                                </Grid.Row>
                            </Grid>
                        </Sidebar.Pusher>
                    </Sidebar.Pushable>
                </div>
            </Router>
        );
    }
}

export default App;
