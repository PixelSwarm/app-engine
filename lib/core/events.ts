﻿namespace Animate {

    /**
     * Describes all the different types of editor events
     */
    export type EditorEventType =
        'change' | 'focus-node';

    export class EditorEvents extends ENUM {
        constructor( v: string ) { super( v ); }

		/**
		* This is called when the project is exporting the data object to the server.
		* The token object passed to this function contains all the information needed to run the project in an Animate runtime.
		* Associate event type is {EditorExportingEvent}
		*/
        static EDITOR_PROJECT_EXPORTING: EditorEvents = new EditorEvents( 'editor_project_exporting' );

		/**
		* This function is called by Animate when everything has been loaded and the user is able to begin their session. Associate event type is {Event}
		*/
        static EDITOR_READY: EditorEvents = new EditorEvents( 'editor_ready' );

		/**
		* This function is called by Animate when the run button is pushed.
		*/
        static EDITOR_RUN: EditorEvents = new EditorEvents( 'editor_run' );

		/**
		* This is called by Animate when we are exporting a container. The token that gets passed should be used to store any optional
		* data with a container. Associate event type is {ContainerDataEvent}
		*/
        static CONTAINER_EXPORTING: EditorEvents = new EditorEvents( 'plugin_container_exporting' );

		/**
		* This is called by Animate when we are saving a container. The token that gets passed should be used to store any optional
		* data with a container.This can be later, re - associated with the container when onOpenContainer is called. Associate event type is {ContainerDataEvent}
		*/
        static CONTAINER_SAVING: EditorEvents = new EditorEvents( 'plugin_container_saving' );

		/**
		* This is called by Animate when we are opening a container. The token that gets passed is filled with optional
		* data when onSaveContainer is called. Associate event type is {ContainerDataEvent}
		*/
        static CONTAINER_OPENING: EditorEvents = new EditorEvents( 'plugin_container_opening' );

		/**
		* Called when an asset is renamed. Associate event type is {AssetRenamedEvent}
		*/
        static ASSET_RENAMED: EditorEvents = new EditorEvents( 'plugin_asset_renamed' );

		/**
		* Called when an asset is selected in the editor. Associate event type is {AssetEvent}
		*/
        static ASSET_SELECTED: EditorEvents = new EditorEvents( 'plugin_asset_selected' );

		/**
		* Called when an asset property is edited by the property grid. Associate event type is {AssetEditedEvent}
		*/
        static ASSET_EDITED: EditorEvents = new EditorEvents( 'plugin_asset_edited' );

		/**
		* Called when an asset is added to a container. Associate event type is {AssetContainerEvent}
		*/
        static ASSET_ADDED_TO_CONTAINER: EditorEvents = new EditorEvents( 'plugin_asset_added_to_container' );

		/**
		* Called when an asset is removed from a container. Associate event type is {AssetContainerEvent}
		*/
        static ASSET_REMOVED_FROM_CONTAINER: EditorEvents = new EditorEvents( 'plugin_asset_removed_from_container' );

		/**
		* Called just before an asset is saved to the server. Associate event type is {AssetEvent}
		*/
        static ASSET_SAVING: EditorEvents = new EditorEvents( 'plugin_asset_saving' );

		/**
		* Called when an asset is loaded from the database. Associate event type is {AssetEvent}
		*/
        static ASSET_LOADED: EditorEvents = new EditorEvents( 'plugin_asset_loaded' );

		/**
		* Called when an asset is disposed off. Associate event type is {AssetEvent}
		*/
        static ASSET_DESTROYED: EditorEvents = new EditorEvents( 'plugin_asset_destroyed' );

		/**
		* Called when an asset is copied in the editor. Associate event type is {AssetCopiedEvent}
		*/
        static ASSET_COPIED: EditorEvents = new EditorEvents( 'plugin_asset_copied' );
    }

    export class OkCancelFormEvent extends Event {
        public text: string;
        public cancel: boolean;

        constructor( eventName: OkCancelFormEvents, text: string ) {
            super( eventName, text );
            this.text = text;
            this.cancel = false;
        }
    }

    export class ContainerEvent extends Event {
        public container: Resources.Container;

        constructor( type: string, container: Resources.Container ) {
            super( type, null );
            this.container = container;
        }
    }

    export class UserEvent extends Event {
        constructor( type: string, data: any ) {
            super( type, data );
        }
    }

    export class ImportExportEvent extends Event {
        live_link: any;

        constructor( eventName: ImportExportEvents, live_link: any ) {
            super( eventName, live_link );
            this.live_link = live_link;
        }
    }

	/**
	* Called when an editor is being exported
	*/
    export class EditorExportingEvent extends Event {
		/**
		* @param {any} token The token object passed to this function contains all the information needed to run the project in an Animate runtime.
		*/
        public token: any;

        constructor( token: any ) {
            super( EditorEvents.EDITOR_PROJECT_EXPORTING, null );
            this.token = token;
        }
    }

	/**
	* Events associated with Containers and either reading from, or writing to, a data token
	*/
    export class ContainerDataEvent extends Event {
		/**
		* {Container} container The container associated with this event
		*/
        public container: Resources.Container;

		/**
		* {any} token The data being read or written to
		*/
        public token: any;

		/**
		* {{ groups: Array<string>; assets: Array<number> }} sceneReferences [Optional] An array of scene asset ID's associated with this container
		*/
        public sceneReferences: { groups: Array<number>; assets: Array<number> };

        constructor( eventName: EditorEvents, container: Resources.Container, token: any, sceneReferences?: { groups: Array<number>; assets: Array<number> }) {
            super( eventName, null );
            this.container = container;
            this.token = token;
            this.sceneReferences = sceneReferences;
        }
    }

	/**
	* Asset associated events
	*/
    export class AssetEvent extends Event {
		/**
		* {Asset} asset The asset associated with this event
		*/
        public asset: Resources.Asset;

        constructor( eventName: EditorEvents, asset: Resources.Asset ) {
            super( eventName, null );
            this.asset = asset;
        }
    }

	/**
	* Called when an asset is renamed
	*/
    export class AssetRenamedEvent extends AssetEvent {
		/**
		* {string} oldName The old name of the asset
		*/
        public oldName: string;

        constructor( asset: Resources.Asset, oldName: string ) {
            super( EditorEvents.ASSET_RENAMED, asset );
            this.oldName = oldName;
        }
    }


	/**
	* Events assocaited with Assets in relation to Containers
	*/
    export class AssetContainerEvent extends AssetEvent {
		/**
		* {Container} container The container assocaited with this event
		*/
        public container: Resources.Container;

        constructor( eventName: EditorEvents, asset: Resources.Asset, container: Resources.Container ) {
            super( eventName, asset );
            this.container = container;
        }
    }


	/**
	* Portal associated events
	*/
    export class PortalEvent extends Event {
        public container: Resources.Container;
        public portal: Portal;
        public oldName: string;

        constructor( type: string, oldName: string, container: Resources.Container, portal: Portal ) {
            super( type, null );
            this.container = container;
            this.portal = portal;
            this.oldName = oldName;
        }
    }

    export class WindowEvent extends Event {
        public window: Window;
        constructor( eventName: WindowEvents, window: Window ) {
            super( eventName, window );
            this.window = window;
        }
    }

    export class ToolbarNumberEvent extends Event {
        public value: number;

        constructor( e: ToolbarNumberEvents, value: number ) {
            super( e, null );
            this.value = value;
        }
    }

    export class ToolbarDropDownEvent extends Event {
        public item: ToolbarItem;

        constructor( item: ToolbarItem, e: EventType ) {
            super( e, null );
            this.item = item;
        }

        dispose() {
            this.item = null;
        }
    }

    export class EditEvent extends Event {
        property: Prop<any>;
        set: EditableSet;

        constructor( property: Prop<any>, set: EditableSet ) {
            super( 'edited' );
            this.property = property;
            this.set = set;
        }
    }

    export class TabEvent extends Event {
        private _pair: TabPair;
        public cancel: boolean;

        constructor( eventName: any, pair: TabPair ) {
            super( eventName, pair );
            this.cancel = false;
            this._pair = pair;
        }

        get pair(): TabPair { return this._pair; }
    }

    export class CanvasEvent extends Event {
        public canvas: Canvas;

        constructor( eventName: CanvasEvents, canvas: Canvas ) {
            super( eventName, canvas );
            this.canvas = canvas;
        }
    }

    /**
	* A simple project event. Always related to a project resource (null if not)
	*/
    export class ProjectEvent<T extends ProjectResource<Engine.IResource>> extends Event {
        public resource: T;
        constructor( type: string, resource: T ) {
            super( type, null );
            this.resource = resource;
        }
    }

    /**
	* An event to deal with file viewer events
    * The event type can be 'cancelled' or 'change'
	*/
    export class FileViewerEvent extends Event {
        public file: Engine.IFile;
        constructor( type: string, file: Engine.IFile ) {
            super( type, file );
            this.file = file;
        }
    }
}