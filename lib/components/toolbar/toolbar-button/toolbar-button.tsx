namespace Animate {

    export interface IToolbarButtonProps {
        onChange?: ( val: boolean ) => void | null;
        pushButton?: boolean;
        selected?: boolean;
        label: string | null;
        imgUrl?: string;
        prefix?: JSX.Element;
        disabled?: boolean;
    }

    export interface IToolbarButtonState {
        selected: boolean;
    }

	/**
	 * A very simple wrapper for a toolbar button
	 */
    export class ToolbarButton extends React.Component<IToolbarButtonProps, IToolbarButtonState> {
        static defaultProps: IToolbarButtonProps = {
            onChange: undefined,
            label: null,
            pushButton: false,
            disabled: false
        };

        constructor( props: IToolbarButtonProps ) {
            super( props );
            this.state = {
                selected: props.selected!
            };
        }

		/**
         * Creates the component elements
         */
        render(): JSX.Element {
            let className = 'toolbar-button unselectable';
            if ( this.state.selected )
                className += ' selected';
            if ( this.props.disabled )
                className += ' disabled';

            return <Tooltip tooltip={this.props.label!} position={TooltipPosition.BOTTOM} offset={0} disabled={this.props.disabled}>
                <div
                    className={className}
                    onClick={() => this.onClick()}>
                    {( this.props.prefix ? this.props.prefix : null )}
                    {( this.props.imgUrl ? <img src={this.props.imgUrl} /> : null )}
                </div>
            </Tooltip>
        }

        /**
        * Called when the props are updated
        */
        componentWillReceiveProps( nextProps: IVCheckboxProps ) {
            if ( nextProps.selected !== this.state.selected )
                this.setState( { selected: nextProps.selected! });
        }

        onClick() {
            if ( this.props.disabled )
                return;

            if ( this.props.pushButton )
                this.selected = !this.state.selected;
            else if ( this.props.onChange )
                this.props.onChange( true );
        }

		/**
		 * Set if the component is selected
		 */
        set selected( val: boolean ) {
            if ( val !== this.state.selected && this.props.onChange )
                this.props.onChange( val );

            this.setState( {
                selected: val
            });
        }

		/**
		 * Get if the component is selected
		 */
        get selected(): boolean { return this.state.selected; }
    }
}