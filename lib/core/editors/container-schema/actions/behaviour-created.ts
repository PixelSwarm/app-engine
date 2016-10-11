namespace Animate {

    export namespace Actions {

        /**
         * An action for the creation of behaviours within a container
         */
        export class BehaviourCreated extends EditorAction {

            definition: BehaviourDefinition;
            instance: Behaviour;
            options: IBehaviour;
            resource: ProjectResource<HatcheryServer.IResource>;

            constructor( definition: BehaviourDefinition, options: IBehaviour, resource?: ProjectResource<HatcheryServer.IResource> ) {
                super();
                this.definition = definition;
                this.resource = resource;
                this.options = options;
            }

            /**
             * Undo the last history action
             */
            undo( editor: Animate.ContainerSchema ) {
                editor.removeItem( this.instance );
                this.instance = null;
            }

            /**
             * Redo the next action
             */
            redo( editor: Animate.ContainerSchema ) {

                switch ( this.definition.behaviourName ) {
                    case 'Asset':
                        this.instance = new BehaviourAsset( this.resource );
                        break;
                    default:
                        this.instance = new Behaviour( this.definition );
                        break;
                }

                this.instance.left = this.options.left;
                this.instance.top = this.options.top;
                this.instance.alias = this.options.alias ? this.options.alias : this.instance.alias;
                editor.addItem( this.instance );
            }
        }

    }
}