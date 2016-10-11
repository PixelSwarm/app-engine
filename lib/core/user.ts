namespace Animate {

	/**
	* This class is used to represent the user who is logged into Animate.
	*/
    export class User extends EventDispatcher {
        private static _singleton = null;
        public entry: UsersInterface.IUserEntry;
        public meta: HatcheryServer.IUserMeta;
        public project: Project;
        private _isLoggedIn: boolean;

        constructor() {
            super();
            User._singleton = this;

            // Create the default entry
            this.entry = { username: '' };
            this.resetMeta();

            this.project = new Project();
            this._isLoggedIn = false;

        }

        /**
		* Resets the meta data
		*/
        resetMeta() {
            this.meta = <HatcheryServer.IUserMeta>{
                bio: '',
                plan: UserPlan.Free,
                imgURL: 'media/blank-user.png',
                maxNumProjects: 0
            };
        }

        /**
		* Checks if a user is logged in or not. This checks the server using
		* cookie and session data from the browser.
		*/
        authenticated(): Promise<boolean> {
            this._isLoggedIn = false;

            const that = this;
            return new Promise<boolean>( function( resolve, reject ) {
                Utils.get<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/authenticated` ).then( function( data ): Promise<ModepressAddons.IGetDetails> {

                    if ( data.error )
                        throw new Error( data.message );

                    if ( data.authenticated ) {
                        that.entry = <UsersInterface.IUserEntry>data.user;
                        that._isLoggedIn = true;
                        return Utils.get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${data.user.username}` );
                    }
                    else {
                        that._isLoggedIn = false;
                        that.resetMeta();
                        return null;
                    }

                }).then( function( data: ModepressAddons.IGetDetails ) {
                    if ( data && data.error )
                        return reject( new Error( data.message ) );

                    that.meta = ( data ? data.data : null );
                    return resolve( true );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });

        }

        /**
		* Tries to log the user in asynchronously.
		* @param user The username of the user.
		* @param password The password of the user.
		* @param rememberMe Set this to true if we want to set a login cookie and keep us signed in.
		*/
        login( user: string, password: string, rememberMe: boolean ): Promise<UsersInterface.IAuthenticationResponse> {
            const token: UsersInterface.ILoginToken = {
                username: user,
                password: password,
                rememberMe: rememberMe
            };
            let response: UsersInterface.IAuthenticationResponse;

            const that = this;
            return new Promise<UsersInterface.IAuthenticationResponse>( function( resolve, reject ) {
                Utils.post<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/users/login`, token ).then( function( data ) {
                    response = data;
                    if ( data.error )
                        throw new Error( data.message );

                    if ( data.authenticated ) {
                        that._isLoggedIn = true;
                        that.entry = <UsersInterface.IUserEntry>data.user;
                        return Utils.get<ModepressAddons.IGetDetails>( `${DB.API}/user-details/${data.user.username}` );
                    }
                    else {
                        that._isLoggedIn = false;
                        that.resetMeta();
                        return null;
                    }

                }).then( function( data: ModepressAddons.IGetDetails ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    that.meta = data.data;
                    return resolve( response );

                }).catch( function( err: IAjaxError ) {
                    that._isLoggedIn = false;
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                })
            });
        }

        /**
		* Tries to register a new user.
		* @param user The username of the user.
		* @param password The password of the user.
		* @param email The email of the user.
		* @param captcha The captcha of the login screen
		*/
        register( user: string, password: string, email: string, captcha: string ): Promise<UsersInterface.IAuthenticationResponse> {
            const that = this,
                token: UsersInterface.IRegisterToken = {
                    username: user,
                    password: password,
                    email: email,
                    captcha: captcha
                };


            return new Promise<UsersInterface.IAuthenticationResponse>( function( resolve, reject ) {
                Utils.post<UsersInterface.IAuthenticationResponse>( `${DB.USERS}/users/register`, token ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    if ( data.authenticated ) {
                        that._isLoggedIn = false;
                        that.entry = <UsersInterface.IUserEntry>data.user;
                    }
                    else
                        that._isLoggedIn = false;

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		* This function is used to resend a user's activation code
		* @param user
		*/
        resendActivation( user: string ): Promise<UsersInterface.IResponse> {
            return new Promise<UsersInterface.IResponse>( function( resolve, reject ) {
                Utils.get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/resend-activation` ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                })
            });
        }

        /**
		* This function is used to reset a user's password.
		* @param user
		*/
        resetPassword( user: string ): Promise<UsersInterface.IResponse> {
            return new Promise<UsersInterface.IResponse>( function( resolve, reject ) {
                Utils.get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/request-password-reset` ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                })
            });
        }

        /**
		* Attempts to log the user out
		*/
        logout(): Promise<UsersInterface.IResponse> {
            const that = this;

            return new Promise<UsersInterface.IResponse>( function( resolve, reject ) {
                Utils.get<UsersInterface.IResponse>( `${DB.USERS}/logout` ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    that.entry = { username: '' };
                    that.meta = <HatcheryServer.IUserMeta>{
                        bio: '',
                        plan: UserPlan.Free,
                        imgURL: 'media/blank-user.png',
                        maxNumProjects: 0
                    };

                    that._isLoggedIn = false;
                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                })
            });
        }

		/**
		* Fetches all the projects of a user. This only works if the user if logged in. If not
		* it will return null.
        * @param index The index to  fetching projects for
        * @param limit The limit of how many items to fetch
        * @param search Optional search text
		*/
        getProjectList( index: number, limit: number, search: string = '' ): Promise<ModepressAddons.IGetProjects> {
            const that = this;

            return new Promise<ModepressAddons.IGetProjects>( function( resolve, reject ) {
                Utils.get<ModepressAddons.IGetProjects>( `${DB.API}/users/${that.entry.username}/projects?verbose=true&index=${index}&limit=${limit}&search=${search}` ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    // Assign the actual plugins
                    for ( let i = 0, l = data.data.length; i < l; i++ ) {
                        const project = data.data[ i ];
                        const plugins: Array<HatcheryServer.IPlugin> = [];
                        for ( let ii = 0, il = project.plugins.length; ii < il; ii++ )
                            plugins.push( getPluginByID( project.plugins[ ii ] ) );

                        project.$plugins = plugins;
                    }

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                })
            });
        }

        /**
		* Creates a new user projects
        * @param name The name of the project
        * @param plugins An array of plugin IDs to identify which plugins to use
        * @param description [Optional] A short description
		*/
        newProject( name: string, plugins: Array<string>, description: string = '' ): Promise<ModepressAddons.ICreateProject> {
            const token: HatcheryServer.IProject = {
                name: name,
                description: description,
                plugins: plugins
            };

            return new Promise<ModepressAddons.ICreateProject>( function( resolve, reject ) {
                Utils.post<ModepressAddons.ICreateProject>( `${DB.API}/projects`, token ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    // Assign the actual plugins
                    const project = data.data;
                    const plugins: Array<HatcheryServer.IPlugin> = [];
                    for ( let ii = 0, il = project.plugins.length; ii < il; ii++ )
                        plugins.push( getPluginByID( project.plugins[ ii ] ) );

                    project.$plugins = plugins;

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                })
            });
        }

        /**
		* Removes a project by its id
        * @param pid The id of the project to remove
		*/
        removeProject( pid: string ): Promise<Modepress.IResponse> {
            const that = this;

            return new Promise<Modepress.IResponse>( function( resolve, reject ) {
                Utils.delete<Modepress.IResponse>( `${DB.API}/users/${that.entry.username}/projects/${pid}` ).then( function( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });

        }

        /**
		* Attempts to update the user's details base on the token provided
        * @returns The user details token
		*/
        updateDetails( token: HatcheryServer.IUserMeta ): Promise<UsersInterface.IResponse> {
            const meta = this.meta;
            const that = this;

            return new Promise<Modepress.IResponse>( function( resolve, reject ) {
                Utils.put( `${DB.API}/user-details/${that.entry.username}`, token ).then( function( data: UsersInterface.IResponse ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );
                    else {
                        for ( const i in token )
                            if ( meta.hasOwnProperty( i ) )
                                meta[ i ] = token[ i ];
                    }

                    return resolve( data );

                }).catch( function( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

		/**
		* Use this function to duplicate a project
		* @param id The project ID we are copying
		*/
        copyProject( id: string ) {
            throw new Error( 'not implemented' );
        }

		/**
		* This function is used to open an existing project.
		*/
        openProject( id: string ) {
            throw new Error( 'not implemented' );
        }

		/**
		* This will delete a project from the database as well as remove it from the user.
		* @param id The id of the project we are removing.
		*/
        deleteProject( id: string ) {
            throw new Error( 'not implemented' );
        }

        get isLoggedIn(): boolean { return this._isLoggedIn; }

		/**
		* Gets the singleton instance.
		*/
        static get get(): User {
            if ( !User._singleton )
                new User();

            return User._singleton;
        }
    }
}