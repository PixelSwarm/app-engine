import { ProjectResource } from './project-resource';
import { IModelOptions } from './model';

/**
* A wrapper for DB file instances
* @events deleted, refreshed
*/
export class File extends ProjectResource<HatcheryServer.IFile> {
    /**
    * @param entry The DB entry of this file
    */
    constructor( options?: IModelOptions<HatcheryServer.IFile> ) {
        super( options );
    }
}