module Animate {

    /**
     *  Extends the project with a selected attribute
     */
    export interface IInteractiveProject extends Engine.IProject {
        selected?: boolean;
    }

    export interface IProjectListProps extends React.HTMLAttributes {
        onProjectSelected?: (project : IInteractiveProject) => void;
        onProjectDClicked?: (project : IInteractiveProject) => void;
        noProjectMessage?: string;
    }

    export interface IProjectListState {
        loading? : boolean;
        searchText?: string;
        selectedProject?: IInteractiveProject;
        errorMsg? : string;
        projects? : IInteractiveProject[];
    }

    /**
     * A list that displays projects
     */
    export class ProjectList extends React.Component<IProjectListProps, IProjectListState> {
        static defaultProps : IProjectListProps = {
            noProjectMessage: "You have no projects"
        }

        private _user: User;

        /**
         * Creates a new instance
         */
        constructor(props) {
            super(props);
            this._user = User.get;
            this.state = {
                loading: false,
                selectedProject: null,
                errorMsg: null,
                projects: [],
                searchText: ""
            };
        }

        /**
         * Removes a project from the list
         * @param {IInteractiveProject} p The project to remove
         */
        removeProject(p: IInteractiveProject) {
            var projects = this.state.projects;
            if ( projects.indexOf(p) != -1 ) {
                projects.splice( projects.indexOf( p ), 1 );
                this.setState({projects: projects});
            }
        }

        /*
         * Called when we select a project
         * @param {IInteractiveProject} project The project to select
         */
        selectProject(project: IInteractiveProject, doubleClick : boolean ) {
            if ( this.state.selectedProject )
                this.state.selectedProject.selected = false;

            project.selected = true;
            var selectedProject : IInteractiveProject;

            if ( this.state.selectedProject != project ) {
                selectedProject = project;
                this.setState({ selectedProject : selectedProject });
            }
            else {
                selectedProject = null;
                this.state.selectedProject.selected = false;
                this.setState({ selectedProject : selectedProject });
            }

            if ( this.props.onProjectSelected ) {
                this.props.onProjectSelected(selectedProject);

                if (doubleClick)
                    this.props.onProjectDClicked(selectedProject);
            }
        }

        /*
        * Fetches a list of user projects
        * @param {number} index
        * @param {number} limit
        */
        fetchProjects(index: number, limit: number) : Promise<number> {
            this.setState({
                loading: true,
                errorMsg: null,
                selectedProject: null
            });

            return new Promise<number>( ( resolve, reject ) => {
                this._user.getProjectList( index, limit, this.state.searchText ).then( (projects) => {
                    this.setState({
                        loading: false,
                        projects: projects.data
                    });

                    resolve(projects.count || 1);
                }).catch( (err: Error) => {
                    this.setState({
                        loading: false,
                        errorMsg: err.message
                    });
                    reject(err);
                });
            });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            const props : IProjectListProps  = Object.assign({}, this.props);
            delete props.noProjectMessage;
            delete props.onProjectSelected;
            delete props.onProjectDClicked;

            return <div {...props} className={'project-list ' + (props.className || '')}>
                <div className="projects-toolbar background">
                    {this.props.children}
                    <SearchBox placeholder="Keywords" onSearch={(e, text) => {
                        this.state.searchText = text;
                        (this.refs["pager"] as Pager).invalidate();
                    }} />
                    {this.state.loading ? <i className="fa fa-cog fa-spin fa-3x fa-fw"></i> : null }
                </div>
                <div className="projects-container">
                    <Pager onUpdate={this.fetchProjects.bind(this)} limit={6} ref="pager">
                        <div className="project-items">
                            <div className="error bad-input" style={{ display: (this.state.errorMsg ? 'block' : '' ) }}>
                                {this.state.errorMsg || ''}
                            </div>
                            {
                                this.state.projects.map(( p, index )=>{
                                    return <div
                                        key={p._id}
                                        className="project-item img-preview unselectable"
                                        onDoubleClick={()=>{
                                            this.selectProject(p, true)
                                        }}
                                        onClick={()=>{
                                                this.selectProject(p, false)
                                            }}>
                                            <div className="preview-child">
                                                <div className="background-tiles inner ng-scope">
                                                    <img className="vert-align" src={( p.image && p.image != '' ? p.image : './media/appling.png' )} />
                                                    <div className="div-center"></div>
                                                </div>
                                            </div>
                                            <div className={ 'item-name' + (p.selected ? ' reg-gradient' : '') }><span className="fa fa-file"/>{p.name}</div>
                                        </div>
                            })}
                            <div className="no-items unselectable" style={{ display: (this.state.projects.length ? 'none' : '')}}>
                                {this.props.noProjectMessage}
                            </div>
                        </div>
                    </Pager>
                </div>
            </div>
        }
    }
}