module Animate
{
	/**
	* An editor which allows a user to select files on the local server.
	*/
	export class PropFile extends PropertyGridEditor
	{		
		constructor( grid: PropertyGrid )
		{
			super( grid );
		}

		/**
		* Called when a property grid is editing an object. The property name, value and type are passed.
		* If this editor can edit the property it returns a valid JQuery object which is responsible for editing
		* the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
		* events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
		* call the notify method.
		* @param {string} propertyName The name of the property we are creating an HTML element for
		* @param {any} propertyValue The current value of that property
		* @param {ParameterType} objectType The type of property we need to create
		* @param {any} options Any options associated with the parameter
		* @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
		*/
		edit( propertyName: string, propertyValue: any, objectType: ParameterType, options: any ): JQuery
		{
			if ( objectType != ParameterType.FILE )
				return null;

			//var parts = propertyValue.split("|");
			var fileID: string = propertyValue.id || "";
			var fileExtensions: Array<string> = propertyValue.extensions || [];
			var path = propertyValue.path || "";

            var project: Project = User.get.project;
            var file: Engine.IFile = project.getResourceByID<FileResource>(fileID, ResourceType.FILE).resource;
			
			//Create HTML	
			var editor: JQuery =
				this.createEditorJQuery( propertyName, "<div class='prop-file'><div class='file-name'>" + ( file ? file.name : path ) + "</div><div class='file-button reg-gradient'>...</div><div class='file-button-image'><img src='media/download-file.png'/></div></div>", propertyValue );


			var that = this;

			//Functions to deal with user interactions with JQuery
            var onFileChosen = function(response: string, event: FileViewerEvent ) 
			{
                FileViewer.get.off( "cancelled", onFileChosen );
                FileViewer.get.off( "change", onFileChosen );

                if (response == "cancelled" )
					return;

                var file: Engine.IFile = event.file;				
				jQuery( ".file-name", editor ).text( ( file ? file.name : path ) );
				that.notify( propertyName, { extensions: fileExtensions, path: ( file ? file.url : "" ), id: ( file ? file._id : "" ), selectedExtension: ( file ? file.extension : "" ) }, objectType );
			};
			
            var mouseUp = function (e: JQueryEventObject  ) 
			{
				if ( jQuery( e.target ).is( ".file-button-image" ) )
				{
					window.open( path, 'Download' );
					return;
				}

				//Remove any previous references
                FileViewer.get.off("cancelled", onFileChosen );
                FileViewer.get.off("change", onFileChosen );
                FileViewer.get.on("change", onFileChosen );
                FileViewer.get.on("cancelled", onFileChosen);
                FileViewer.get.choose(fileExtensions);
			};

			//Add listeners
			editor.on( "mouseup", mouseUp );

			//Finall return editor as HTML to be added to the page
			return editor;
		}

		/**
		* Updates the value of the editor object  because a value was edited externally.
		* @param {any} newValue The new value
		* @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
		*/
		update( newValue, editHTML )
		{
			jQuery( "input", editHTML ).val( newValue );
		}
	}
}