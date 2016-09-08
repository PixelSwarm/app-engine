namespace Animate {

	/**
	* A simple interface for property grid editors
	*/
    export abstract class PropertyGridEditor {

		constructor( grid: PropertyGrid ) {
        }

        /**
		* Checks a property to see if it can edit it
		* @param {Prop<any>} prop The property being edited
        * @returns {boolean}
		*/
        abstract canEdit(prop: Prop<any>): boolean;

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit(prop: Prop<any>, container: Component) {
			return null;
		}

		/* This function is called when the grid is cleaning up all the editors. */
        cleanup() {
		}
	}
}