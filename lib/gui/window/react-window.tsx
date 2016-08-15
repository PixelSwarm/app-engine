module Animate {

    export interface IReactWindowProps {
        autoCenter? :boolean;
        title?: string;
        modal?: boolean;
        popup?: boolean;
        controlBox? : boolean;
        canResize? : boolean;
        _id?: number;
        _closing?: () => void;
    }

    export interface IReactWindowState {
        centered? : boolean;
    }

    /**
     * The base class for all windows in the application. Most windows will be derived from this class.
     * You can display/hide the window by using the static Window.show and Window.hide methods.
     */
    export class ReactWindow extends React.Component<IReactWindowProps, IReactWindowState> {
        private static _openWindows: number = 0;
        private static _windows : { [id: number]: {
            window : HTMLElement,
            jsx : JSX.Element
        }} = {};

        static defaultProps: IReactWindowProps = {
            modal: true,
            popup: false,
            controlBox: true,
            title: null,
            autoCenter: true,
            canResize: true
        };

        private _mouseMoveProxy: any;
        private _mouseUpProxy: any;
        private _mouseDeltaX: number;
        private _mouseDeltaY: number;

        /**
         * Creates an instance of the react window
         */
        constructor(props: IReactWindowProps) {
            super(props);

            this._mouseMoveProxy = this.onMouseMove.bind(this);
            this._mouseUpProxy = this.onMouseUp.bind(this);
            this._mouseDeltaX = 0;
            this._mouseDeltaY = 0;
            this.state = {
                centered: true
            };
        }

        /**
         * Shows a React window component to the user
         * @param {React.ComponentClass<IReactWindowProps>} windowType The Class of Window to render.
         * @param {IReactWindowProps} props The properties to use for the window component
         */
        static show(windowType : React.ComponentClass<IReactWindowProps>, props : IReactWindowProps = {}) {
            let id = ReactWindow._openWindows + 1;
            let windowView = document.createElement("div");
            windowView.className = "window-view";
            ReactWindow._openWindows = id;

            props._closing = () => {
                ReactWindow._windows[id].window.remove();
                ReactDOM.unmountComponentAtNode( ReactWindow._windows[id].window );
                ReactWindow._windows[id] = null;
            };

            let component = React.createElement<IReactWindowProps>(windowType, props);
            ReactWindow._windows[id] = {
                jsx: component,
                window : windowView
            };

            // Add the tooltip to the dom
            document.body.appendChild( windowView );
            ReactDOM.render( component, windowView );
            return ReactWindow._openWindows;
        }

        /**
         * Hides/Removes a window component by id
         * @param {number} id
         */
        static hide(id : number) {
            ReactDOM.unmountComponentAtNode( ReactWindow._windows[id].window );
            ReactWindow._windows[id] = null;
        }

        /**
         * When the user clicks the the header bar we initiate its dragging
         */
        onHeaderDown(e: React.MouseEvent) {
            e.preventDefault();
            let w = this.refs['window'] as ReactWindow;
            let elm = ReactDOM.findDOMNode(w) as HTMLElement;
            let bounds = elm.getBoundingClientRect();

            this._mouseDeltaX = e.pageX - bounds.left;
            this._mouseDeltaY = e.pageY - bounds.top;

            window.addEventListener('mouseup', this._mouseUpProxy);
            document.body.addEventListener('mousemove', this._mouseMoveProxy);
        }

        /**
         * When the mouse moves and we are dragging the header bar we move the window
         */
        onMouseMove(e: MouseEvent) {
            let w = this.refs['window'] as ReactWindow;
            let elm = ReactDOM.findDOMNode(w) as HTMLElement;
            let x = e.pageX -  this._mouseDeltaX;
            let y = e.pageY -  this._mouseDeltaY;
            elm.style.left = x + 'px';
            elm.style.top = y + 'px';
        }

        /**
         * When the mouse is up we remove the dragging event listeners
         */
        onMouseUp(e: MouseEvent) {
            window.removeEventListener('mouseup', this._mouseUpProxy);
            document.body.removeEventListener('mousemove', this._mouseMoveProxy);
        }

        /**
         * When the component is mounted
         */
        componentDidMount() {

            // When the component is mounted, check if it needs to be centered
            if ( this.props.autoCenter ) {
                let w = this.refs['window'] as ReactWindow;
                let elm = ReactDOM.findDOMNode(w) as HTMLElement;
                elm.style.left = (( document.body.offsetWidth * 0.5 ) - ( elm.offsetWidth * 0.5 )) + 'px';
                elm.style.top = (( document.body.offsetHeight * 0.5 ) - ( elm.offsetWidth * 0.5 )) + 'px';
            }

            // Make the form resizable
            if ( this.props.canResize ) {
                let elm = ReactDOM.findDOMNode( this.refs['window'] );
                jQuery(elm).resizable({
                    minHeight: 50,
                    minWidth: 50,
                    helper: "ui-resizable-helper"
                });
            }
        }

        /**
         * Called when the window is to be removed
         */
        componentWillUnmount() {
            window.removeEventListener('mouseup', this._mouseUpProxy);
            document.body.removeEventListener('mousemove', this._mouseMoveProxy);

            if ( this.props.canResize ) {
                 let elm = ReactDOM.findDOMNode( this.refs['window'] );
                jQuery(elm).resizable('destroy');
            }
        }

        /**
         * When we click the modal we highlight the window
         */
        onModalClick() {
            let elm = ReactDOM.findDOMNode(this.refs['window']) as HTMLElement;
            elm.className = 'window';
            setTimeout(function(){
                elm.className = 'window anim-shadow-focus';
            }, 30);
        }

        /**
         * When we click the close button
         */
        onClose() {
            this.props._closing();
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let controlBox : JSX.Element;

            if (this.props.controlBox) {
                controlBox = <div className='window-control-box' onMouseDown={(e) =>{this.onHeaderDown(e) }}>
                    <div
                        onClick={() => { this.onClose(); }}
                        className='close-but'>X</div>
                    <div className='window-header'>{this.props.title}</div>
                    <div className='fix'></div>
                </div>
            }
            return <div>
                {(this.props.modal ? <div className='modal-backdrop' onClick={()=>{ this.onModalClick(); }}></div> : null)}
                <div className='window' ref="window">
                    {controlBox}
                    <div className={'window-content' + (!this.props.controlBox ? ' no-control' : '')}>
                        {this.props.children}
                    </div>
                </div>
            </div>;
        }
    }
}