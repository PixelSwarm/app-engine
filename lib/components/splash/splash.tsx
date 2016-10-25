﻿namespace Animate {
    export enum SplashMode {
        WELCOME,
        NEW_PROJECT,
        OPENING
    }

    export interface ISplashProps extends HatcheryProps {
        user?: IUser;
        splash?: ISplashScreen;
    }

    export interface ISplashStats {
        mode?: SplashMode
        project?: HatcheryServer.IProject;
    }

    // Connects th splash screen with its store properties
    @ReactRedux.connect<IStore, ISplashProps>(( state ) => {
        return {
            user: state.user,
            splash: state.splash
        }
    })

    /**
     * The splash screen when starting the app
     */
    export class Splash extends React.Component<ISplashProps, ISplashStats> {

        /**
         * Creates an instance of the splash screen
         */
        constructor( props: ISplashProps ) {
            super( props );
            this.state = {
                mode: SplashMode.WELCOME
            };
        }

        renderWelcome() {
            const dispatch = this.props.dispatch!;
            const username = this.props.user!.entry!.username!;
            const splash = this.props.splash!;

            return (
                <ProjectsOverview
                    splash={splash}
                    username={username}
                    onProjectDelete={( project ) => dispatch( removeProject( username, project._id ) )}
                    onProjectsRefresh={( index, limit, searchterm ) => dispatch( getProjectList( username, index, limit, searchterm ) )}
                    onCreateProject={() => { dispatch( setSplashScreen( 'new-project' ) ) } }
                    onOpenProject={( project ) => {
                        if ( !project )
                            return;

                        this.setState( {
                            mode: SplashMode.OPENING,
                            project: project
                        });
                    } }
                    />
            )
        }

        renderOpenProject() {
            const dispatch = this.props.dispatch!;

            return (
                <OpenProject
                    dispatch={dispatch}
                    project={this.state.project!}
                    onComplete={() => {
                        dispatch( LogActions.message( `Opened project '${this.state.project!.name!}''` ) );
                        throw new Error( 'Not implemented' );
                    } }
                    onCancel={() => { dispatch( setSplashScreen( 'welcome' ) ) } }
                    />
            );
        }

        renderNewProject() {
            const dispatch = this.props.dispatch!;
            const splash = this.props.splash!;

            return (
                <NewProject
                    splash={splash}
                    onCreateProject={( options ) => { dispatch( createProject( options ) ) } }
                    onCancel={() => { dispatch( setSplashScreen( 'welcome' ) ) } }
                    />
            );
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const splash = this.props.splash!;
            const dispatch = this.props.dispatch!;

            let mainView: JSX.Element | undefined;

            switch ( splash.screen ) {
                case 'welcome':
                    mainView = this.renderWelcome();
                    break;
                case 'opening-project':
                    mainView = this.renderOpenProject();
                    break;
                default:
                    mainView = this.renderNewProject();
                    break
            }

            return <div id="splash">
                <div className="logo">
                    <div className="logout background-a">
                        <a onClick={() => { dispatch( logout() ) } }>
                            <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
                        </a>
                    </div>
                    <h2>Hatchery</h2>
                </div>
                <div id="splash-view">
                    {mainView}
                </div>
            </div>
        }
    }
}