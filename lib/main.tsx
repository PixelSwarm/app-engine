namespace Animate {
    export var store: Redux.Store<any>;
}

declare let _cache: string;
const __plugins: { [ name: string ]: Array<HatcheryServer.IPlugin> } = {};
let __newPlugin: Animate.IPlugin | null = null;

/**
 * Goes through each of the plugins and returns the one with the matching ID
 * @param id The ID of the plugin to fetch
 */
function getPluginByID( id: string ): HatcheryServer.IPlugin | null {
    for ( const pluginName in __plugins ) {
        for ( let i = 0, l = __plugins[ pluginName ].length; i < l; i++ )
            if ( __plugins[ pluginName ][ i ]._id === id )
                return __plugins[ pluginName ][ i ];
    }

    return null;
}

/**
 * Returns a formatted byte string
 */
function byteFilter( bytes, precision: number = 1 ): string {
    if ( isNaN( parseFloat( bytes ) ) || !isFinite( bytes ) ) return '-';
    const units = [ 'bytes', 'kB', 'MB', 'GB', 'TB', 'PB' ],
        num = Math.floor( Math.log( bytes ) / Math.log( 1024 ) );
    return ( bytes / Math.pow( 1024, Math.floor( num ) ) ).toFixed( precision ) + ' ' + units[ num ];
}

/**
 * Sorts the plugins based on their versions
 */
function sortPlugins( plugins: HatcheryServer.IPlugin[] ) {
    for ( let i = 0, l = plugins.length; i < l; i++ ) {
        if ( !__plugins[ plugins[ i ].name! ] )
            __plugins[ plugins[ i ].name! ] = [];
        else
            continue;

        let pluginArray = __plugins[ plugins[ i ].name! ];

        for ( let ii = 0; ii < l; ii++ )
            if ( plugins[ ii ].name === plugins[ i ].name )
                pluginArray.push( plugins[ ii ] );

        // Sort the plugins based on their versions
        pluginArray = pluginArray.sort( function compare( a, b ) {
            if ( a === b )
                return 0;

            const a_components = a.version!.split( '.' );
            const b_components = b.version!.split( '.' );

            const len = Math.min( a_components.length, b_components.length );

            // loop while the components are equal
            for ( let i = 0; i < len; i++ ) {
                // A bigger than B
                if ( parseInt( a_components[ i ] ) > parseInt( b_components[ i ] ) )
                    return 1;

                // B bigger than A
                if ( parseInt( a_components[ i ] ) < parseInt( b_components[ i ] ) )
                    return -1;
            }

            // If one's a prefix of the other, the longer one is greater.
            if ( a_components.length > b_components.length )
                return 1;

            if ( a_components.length < b_components.length )
                return -1;

            // Otherwise they are the same.
            return 0;
        });
    }
}

/**
 * Creates the redux store for the application
 */
function createStore(): Redux.Store<any> {

    // Creates the thunk middleware so that we can return
    // functions to redux dispatch actions
    function createThunkMiddleware( extraArgument?): any {
        return ( { dispatch, getState }) => next => action => {
            if ( typeof action === 'function' )
                return action( dispatch, getState, extraArgument );

            return next( action );
        };
    }

    const thunk = createThunkMiddleware();
    thunk.withExtraArgument = createThunkMiddleware;


    // Create the reducers object
    const reducers = Redux.combineReducers( {
        project: Animate.projectReducer,
        editorState: Animate.editorReducer,
        logs: Animate.loggerReducer
    });

    // Creat the store
    const store = Redux.createStore( reducers, Redux.applyMiddleware( thunk ) );
    store.subscribe(() => {
        console.log( 'store changed', store.getState() )
    });

    return store;
}

/**
 * Once the plugins are loaded from the DB
 */
function onPluginsLoaded( plugins: HatcheryServer.IPlugin[] ) {
    sortPlugins( plugins );

    Animate.store = createStore();

    // Create the application element
    ReactDOM.render((
        <ReactRedux.Provider store={Animate.store}>
            <Animate.Application />
        </ReactRedux.Provider> ), document.getElementById( 'main' ) ! );
}


// Once the document is ready we begin
jQuery( document ).ready( function() {
    // Make sure we call ajax with credentials on
    jQuery.ajaxSetup( {
        crossDomain: true,
        xhrFields: { withCredentials: true }
    });

    // Show the loading animation
    Animate.LoaderBase.showLoader();

    // Donwload the plugins available to this user
    jQuery.getJSON( `${Animate.DB.API}/plugins` ).done( function( response: ModepressAddons.IGetProjects ) {
        onPluginsLoaded( response.data );
    }).fail( function( err: JQueryXHR ) {
        document.write( `An error occurred while connecting to the server. ${err.status}: ${err.responseText}` );
    }).always( function() {
        Animate.LoaderBase.hideLoader();
    });
});