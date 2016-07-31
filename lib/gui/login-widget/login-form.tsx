module Animate
{
    export interface ILoginFormProps
    {
        onLogin: () => void;
        onLoadingChange? : (loading: boolean) => void;
        switchMode: () => void;
    }

    export interface ILoginFormState
    {
        loading?: boolean;
        username?: string;
        errorMsg?: string;
        error?: boolean;
    }

    export class LoginForm extends React.Component< ILoginFormProps, ILoginFormState>
    {
        private _user: User;

        /**
         * Creates a new instance
         */
        constructor()
        {
            super();
            this._user = User.get;
            this.state = {
                loading: false,
                username : "",
                errorMsg : "",
                error : false
            };
        }

        /*
        * General error handler
        */
        loginError(err: Error)
        {
            if ( this.props.onLoadingChange )
                this.props.onLoadingChange(false);

            this.setState({
                loading: false,
                errorMsg: err.message,
                error: true
            });
        }

        /*
        * General success handler
        */
        loginSuccess(data: UsersInterface.IResponse)
        {
            if ( this.props.onLoadingChange )
                this.props.onLoadingChange(false);

            this.setState({
                loading: false,
                errorMsg: data.message,
                error: data.error
            });
        }

        /**
         * Attempts to reset the users password
         */
        resetPassword()
        {
            var that = this;
            if (this.state.username == "")
            {
                return this.setState({
                    error : true,
                    errorMsg: "Please specify a username or email to fetch"
                });
            }

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange(true);

            this.setState({ loading: true });
            this._user.resetPassword(this.state.username)
                .then(this.loginSuccess.bind(that))
                .catch(this.loginError.bind(that));
        }

        /**
         * Attempts to resend the activation code
         */
        resendActivation()
        {
            var user = this.state.username;
            var that = this;

            if (user == "")
            {
                 return this.setState({
                    error : true,
                    errorMsg: "Please specify a username or email to fetch"
                });
            }

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange(true);

            this.setState({ loading: true });
            this._user.resendActivation(user)
                .then(this.loginSuccess.bind(that))
                .catch(this.loginError.bind(that));
        }

        /**
        * Attempts to log the user in
        */
        login( json )
        {
            var that = this;

            if ( this.props.onLoadingChange )
                this.props.onLoadingChange(true);

            this.setState({
                loading: true
            });

            this._user.login( json.username, json.password, json.remember )
                .then((data) =>
                {
                    if ( this.props.onLoadingChange )
                        this.props.onLoadingChange(false);

                    this.setState({
                        loading: false,
                        errorMsg: data.message,
                        error: data.error
                    });

                    if (that._user.isLoggedIn)
                        this.props.onLogin();
                })
                .catch(this.loginError.bind(that));
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element
        {
            return <div className='login animate-all fade-in'>
                <VForm name="login"
                    autoComplete="off"
                    onValidationError={(errors, form)=> {
                        this.setState({
                            errorMsg: `${Utils.capitalize(errors[0].name)} : ${errors[0].error}`,
                            error : true
                            })
                    }}
                    onValidationsResolved={(form)=> {
                        this.setState({ errorMsg: '' })
                    }}
                    onSubmitted={(e, json, form) => {
                        this.login(json);
                    }}>
                    <VInput
                        autoComplete="off"
                        placeholder="Email or Username"
                        autoFocus=""
                        type='text'
                        name="username"
                        onChange={(e)=>{ this.setState({ username : (e.target as HTMLInputElement).value })}}
                        value={this.state.username}
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHA_EMAIL}
                        />

                    <VInput
                        autoComplete="off"
                        placeholder="Password"
                        autoFocus=""
                        type='password'
                        name="password"
                        validator={ValidationType.NOT_EMPTY | ValidationType.ALPHANUMERIC_PLUS}
                        />

                    <a id="forgot-pass" className={(this.state.loading ? 'disabled' : null)}
                        onClick={(e) => this.resetPassword()}>
                        Forgot
                    </a>
                    <div
                        className={
                            ( this.state.error ? 'error ' : 'success ' ) +
                            ( this.state.errorMsg != '' ? 'show-msg ' : '' ) +
                            'label login-msg fade-in animate-slow'}>
                        {this.state.errorMsg}
                    </div>
                    <VCheckbox
                        label="Remember me"
                        checked={true}
                        name="remember"
                        />
                    <br />
                    <a
                        className={(this.state.loading ? 'disabled' : '')}
                        onClick={(e) => this.resendActivation()}>
                        Resend Activation Email
                    </a>
                    <br />
                    <div className="double-column">
                        <button
                            type="button"
                            disabled={this.state.loading}
                            className=" button reg-gradient en-register animate-all"
                            onClick={(e) => this.props.switchMode() }>
                            Register <span className='fa fa-user' />
                        </button>
                    </div>
                    <div className="double-column">
                        <button type='submit' disabled={this.state.loading} className=" button reg-gradient en-login animate-all">
                        Login <span className='fa fa-sign-in' />
                        </button>
                    </div>
                </VForm>
            </div>
        }
    }
}