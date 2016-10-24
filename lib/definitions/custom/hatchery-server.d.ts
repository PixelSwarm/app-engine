
// Extensions to the server interface that are relevant for the client
declare namespace HatcheryServer {

    // Extends the IProject interface to include additional data
    export interface IProject {
        $plugins?: Array<IPlugin>;
        selected?: boolean;
    }

    // Extends the IPlugin interface to include additional data
    export interface IPlugin {
        $loaded?: boolean;
        $error?: string | null;
        $instance?: Animate.IPlugin;
    }

    /**
     * An interface for describing a container workspace
     * The frontend project can extend this interface and flesh out its inner workings
     */
    export interface IContainerWorkspace {
        items: Animate.ICanvasItem[];
        properties: any;
        activeLink: Animate.ILinkItem | null;
    }
}