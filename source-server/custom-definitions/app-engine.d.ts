﻿declare module Engine
{
    export interface IResource
    {
        name?: string;
        projectId?: any;
        user?: string;
        createdOn?: number;
        lastModified?: number;
        _id?: any;
    }

    /**
    * An interface that is used to describe the assets model
    */
    export interface IAsset extends IResource
    {
        shallowId?: number;
        className?: string;
        json?: Array<{ name: string; category: string; value: any; type: string; }>;
    }

    /**
    * An interface that is used to describe the plugin model
    */
    export interface IPlugin
    {
        name?: string;
        description?: string;
        url?: string;
        plan?: number;
        deployables?: Array<string>;
        image?: string;
        author?: string;
        version?: string;
        createdOn?: number;
        lastModified?: number;
        isPublic?: boolean;
        _id?: any;
    }

    /**
    * An interface that is used to describe the project model
    */
    export interface IProject
    {
        name?: string;
        description?: string;
        image?: string;
        category?: string;
        subCategory?: string;
        public?: boolean;
        curFile?: string;
        rating?: number;
        suspicious?: boolean;
        deleted?: boolean;
        numRaters?: number;
        user?: string;
        build?: any;
        type?: number;
        tags?: Array<string>;
        readPrivileges?: Array<string>;
        writePrivileges?: Array<string>;
        adminPrivileges?: Array<string>;
        plugins?: Array<any>;
        files?: Array<string>;
        createdOn?: number;
        lastModified?: number;
        _id?: any;  
    }
    
    /**
    * An interface that is used to describe the user's engine details
    */
    export interface IUserMeta
    {
        user?: string;
        bio?: string;
        image?: any;
        plan?: number;
        website?: string;
        customerId?: string;
        maxProjects?: number;
        _id?: any;
    }

    /**
    * An interface that is used to describe a project build
    */
    export interface IBuild extends IResource
    {
        notes?: string;
        version?: string;
        public?: boolean;
        css?: string;
        liveHTML?: string;
        liveLink?: string;
        liveToken?: string;
        totalVotes?: number;
        totalVoters?: number;
    }

    /**
    * An interface that is used to describe project behaviours
    */
    export interface IBehaviour extends IResource
    {
        shallowId?: number;
        json?: string;
    }

    /**
    * An interface that is used to describe project groups
    */
    export interface IGroup extends IResource
    {
        shallowId ?: number;
        items ?: Array<number>;
    }

    /**
    * An interface that is used to describe users files
    */
    export interface IFile extends IResource
    {
        url?: string;
        tags ?: Array<string>;
        previewPath?: string;
        extension?: string;
        previewUrl ?: string;
        global ?: boolean;
        favourite ?: boolean;
        size ?: number;
        shallowId?: number;
        bucketId?: string;
        identifier?: string;
    }
}

declare module ModepressAddons
{
    export interface ICreateProject extends Modepress.IGetResponse<Engine.IProject> { }
    export interface ICreateResource extends Modepress.IGetResponse<Engine.IResource> { }
    export interface ICreateAsset extends Modepress.IGetResponse<Engine.IAsset> { }
    export interface ICreateBehaviour extends Modepress.IGetResponse<Engine.IBehaviour> { }
    export interface ICreateFile extends Modepress.IGetResponse<Engine.IFile> { }
    export interface ICreateGroup extends Modepress.IGetResponse<Engine.IGroup> { }
    export interface ICreatePlugin extends Modepress.IGetResponse<Engine.IPlugin> { }
    export interface ICreateBuild extends Modepress.IGetResponse<Engine.IBuild> { }

    export interface IGetBuilds extends Modepress.IGetArrayResponse<Engine.IBuild> { }
    export interface IGetProjects extends Modepress.IGetArrayResponse<Engine.IProject> { }
    export interface IGetDetails extends Modepress.IGetResponse<Engine.IUserMeta> { }
    export interface IGetBehaviours extends Modepress.IGetArrayResponse<Engine.IBehaviour> { }
    export interface IGetFiles extends Modepress.IGetArrayResponse<Engine.IFile> { }
    export interface IGetGroups extends Modepress.IGetArrayResponse<Engine.IGroup> { }
    export interface IGetAssets extends Modepress.IGetArrayResponse<Engine.IAsset> { }
    export interface IGetPlugins extends Modepress.IGetArrayResponse<Engine.IPlugin> { }
    export interface IGetResources extends Modepress.IGetArrayResponse<Engine.IResource> { }
}

declare module "engine" {
    export = Engine;
}

declare module "modepress-addons"
{
    export = ModepressAddons;
}