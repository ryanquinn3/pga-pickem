import React, { Component } from 'react';
import { Form, Container, Header, Grid, Message, Icon } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import isEmail from 'validator/lib/isEmail';

import { isLoggedIn } from '../auth';
import { WhiteText } from '../theme';

export default class SignUp extends Component {
    
    static isPrivate = false;

    state = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: ''
    }

    fieldChanged(key, e){
        this.setState({ [key]: e.target.value });
    }

    onSubmit = () => {
      if(this.formValid()){
        this.props.onSubmit(this.state);
      }
    }

    formValid = () => {
       const { firstName, lastName, email, password, passwordConfirm } = this.state;
       return [
         firstName.length,
         lastName.length,
         isEmail(email),
         password.length,
         password === passwordConfirm
       ].every(Boolean);
    }

    renderError = () => {
      if(this.props.error){
        return ( 
          <Message attached='bottom' error>
            <Icon name="warning circle"/>
            {this.props.error.message}
          </Message>
        );
      }
      return null;
    }

    render() {
        const { firstName, lastName, email, password, passwordConfirm } = this.state;
        const { error } = this.props; 
        const ErrorPanel = this.renderError;

        if(isLoggedIn()){
            return <Redirect to='/entry'/>
        }
        return (
            <Container>
              <Grid centered columns={1}>
                <Grid.Column mobile={16}>
                    <Message
                    attached
                    header='Welcome to U.S. Open Pool'
                    content='In order to enter your picks you need to create an account. Once your picks have been set and the tournament has started you will not need to log in again.'
                    />
                  <Form as="div" className="attached fluid segment">
                      <Form.Input 
                        label='First Name' 
                        value={firstName}
                        onChange={this.fieldChanged.bind(this, 'firstName')}
                        type='text' />
                      <Form.Input 
                        label='Last Name'
                        value={lastName}
                        onChange={this.fieldChanged.bind(this, 'lastName')}
                        type='text' />
                      <Form.Input 
                        label='Email' 
                        value={email}
                        onChange={this.fieldChanged.bind(this, 'email')}
                        type='email' />
                      <Form.Input 
                        label='Password (Do not forget this before the start of the tournament -- there is no password reset)' 
                        value={password}
                        onChange={this.fieldChanged.bind(this, 'password')}
                        type='password' />
                      <Form.Input 
                        label='Confirm Password'
                        value={passwordConfirm}
                        onChange={this.fieldChanged.bind(this, 'passwordConfirm')}
                        type='password' />
                      <Form.Button
                        onClick={this.onSubmit}
                        disabled={!this.formValid()}>
                        Sign Up
                      </Form.Button>
                  </Form>
                  <Message attached='bottom' warning>
                        <Icon name='help' />
                        Already signed up?&nbsp;<Link to="/login">Login</Link>&nbsp;instead.
                  </Message>
                 <ErrorPanel/>
                </Grid.Column>
              </Grid>
            </Container>
        )
    }
}