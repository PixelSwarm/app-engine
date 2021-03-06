﻿import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAuthenticated, UserEvent, canEdit, IAuthReq, Model, getUser, IRemoveResponse, EventManager, isValidID} from "modepress-api";
import {PermissionController} from "./permission-controller";
import {BuildController} from "./build-controller";
import {ProjectModel} from "../models/project-model";
import {IProject} from "engine";
import * as winston from "winston";

/**
* A controller that deals with project models
*/
export class ProjectController extends Controller
{
	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new ProjectModel()]);

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/:user/:id?", <any>[getUser, this.getProjects.bind(this)]);
        router.put("/:user/:id", <any>[canEdit, this.updateProject.bind(this)]);
        router.delete("/:user/:ids", <any>[canEdit, this.remove.bind(this)]);
        router.post("/create", <any>[isAuthenticated, this.createProject.bind(this)]);

        // Register the path
        e.use("/app-engine/projects", router);

        EventManager.singleton.on("Removed", this.onUserRemoved.bind(this));
    }

    /**
    * Called whenever a user has had their account removed
    * @param {UserEvent} event
    */
    private onUserRemoved(event: UserEvent)
    {
        this.removeByUser(event.username );
    }

    /**
    * Removes projects by a given query
    * @param {any} selector
    * @returns {Promise<IRemoveResponse>}
    */
    removeByQuery(selector: any): Promise<IRemoveResponse>
    {
        var toRet: IRemoveResponse = { error: false, message: "0 items have been removed", itemsRemoved: [] };
        var model = this.getModel("en-projects");
        var buildCtrl = BuildController.singleton;
        var numRemoved = 0;

        return new Promise<IRemoveResponse>(function (resolve, reject)
        {
            model.findInstances<Engine.IProject>(selector).then(function (instances)
            {
                if (instances.length == 0)
                    return resolve(toRet);

                instances.forEach(function (val, index)
                {
                    buildCtrl.removeByProject(val._id, val.dbEntry.user).then(function (numDeleted)
                    {
                        return model.deleteInstances(<Engine.IProject>{ _id: val._id });

                    }).then(function (numDeleted)
                    {
                        numRemoved++;
                        toRet.itemsRemoved.push({ id: val._id, error: false, errorMsg: "" });
                        if (index == instances.length - 1)
                        {
                            toRet.message = `${numRemoved} items have been removed`;
                            return resolve(toRet);
                        }

                    }).catch(function (err: Error)
                    {
                        toRet.itemsRemoved.push({ id: val._id, error: true, errorMsg: err.message });
                        toRet.error = true;
                        toRet.message = `An error occurred when deleting project ${val._id}`
                        winston.error(toRet.message + " : " + err.message, { process: process.pid });
                    });
                });

            }).catch(function (err: Error)
            {
                toRet.error = true;
                toRet.message = `An error occurred when deleting projects by query : ${err.message}`
                winston.error(toRet.message, { process: process.pid });
                return resolve(toRet);
            });
        });
    }

    /**
    * Removes a project by user
    * @param {string} user
    * @returns {Promise<IRemoveResponse>}
    */
    removeByUser(user: string): Promise<IRemoveResponse>
    {
        return this.removeByQuery(<Engine.IProject>{ user: user });
    }

    /**
    * Removes a project by its id
    * @param {Array<string>} ids
    * @returns {Promise<IRemoveResponse>}
    */
    removeByIds(ids: Array<string>, user: string): Promise<IRemoveResponse>
    {
        var findToken: Engine.IProject = { user: user };
        var $or: Array<Engine.IProject> = [];

        for (var i = 0, l = ids.length; i < l; i++)
            $or.push({ _id: new mongodb.ObjectID(ids[i]) });

        if ($or.length > 0)
            findToken["$or"] = $or;

        return this.removeByQuery(findToken);
    }

    /**
    * Attempts to update a project
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private updateProject(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-projects");
        var that = this;
        var project: string = req.params.id;
        var updateToken: Engine.IProject = {};
        var token: Engine.IProject = req.body;

        // Verify the project ID
        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));

        updateToken._id = new mongodb.ObjectID(project);
        updateToken.user = req._user.username;

        model.update(updateToken, token).then(function (instance)
        {
            if (instance.error)
            {
                winston.error(<string>instance.tokens[0].error, { process: process.pid });
                return res.end(JSON.stringify(<IResponse>{
                    error: true,
                    message: <string>instance.tokens[0].error
                }));
            }

            res.end(JSON.stringify(<IResponse>{
                error: false,
                message: `[${instance.tokens.length}] Projects updated`
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Removes all projects by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    remove(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var that = this;
        var target = req.params.user;
        var projectIds = req.params.ids.split(",");

        for (var i = 0, l = projectIds.length; i < l; i++)
            if (!isValidID(projectIds[i]))
                return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid object id" }));

        that.removeByIds(projectIds, target).then(function(response)
        {
            res.end(JSON.stringify(<IRemoveResponse>response));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Gets projects based on the format of the request
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    createProject(req: IAuthReq, res: express.Response, next: Function)
    {
        // ✔ Check logged in + has rights to do request
        // ✔ Create a build
        // ✔ Sanitize details
        // ✔ Create a project
        // ✔ Associate build with project and vice-versa
        // ✔ Check if project limit was reached - if over then remove project

        res.setHeader('Content-Type', 'application/json');
        var token: Engine.IProject = req.body;
        var projects = this.getModel("en-projects");
        var buildCtrl = BuildController.singleton;
        var newBuild: Modepress.ModelInstance<Engine.IBuild>;
        var newProject: Modepress.ModelInstance<Engine.IProject>;
        var that = this;

        // User is passed from the authentication function
        token.user = req._user.username;

        // Create build
        buildCtrl.createBuild(req._user.username).then(function (build)
        {
            newBuild = build;
            token.build = newBuild._id;
            return projects.createInstance(token);

        }).then(function(project)
        {
            newProject = project;

            // Link build with new project
            return buildCtrl.linkProject(newBuild._id, newProject._id);

        }).then(function ()
        {
            // Make sure we're still in the limit
            PermissionController.singleton.projectsWithinLimits(req._user).then(function ()
            {
                // Finished
                res.end(JSON.stringify(<ModepressAddons.ICreateProject>{
                    error: false,
                    message: `Created project '${token.name}'`,
                    data: newProject.schema.generateCleanData(false, newProject._id)
                }));

            }).catch(function (err: Error)
            {
                // Not in the limit - so remove the project and tell the user to upgrade
                that.removeByIds([newProject._id], req._user.username);
                res.end(JSON.stringify(<IResponse>{ error: true, message: err.message }));
            });

        }).catch(function (err: Error)
        {
            winston.error(err.message, { process: process.pid });

            // Make sure any builds were removed if an error occurred
            if (newBuild)
            {
                buildCtrl.removeByIds([newBuild._id.toString()], req._user.username).then(function ()
                {
                    res.end(JSON.stringify(<IResponse>{ error: true, message: err.message }));

                }).catch(function (err: Error)
                {
                    winston.error(err.message, { process: process.pid });
                    res.end(JSON.stringify(<IResponse>{ error: true, message: err.message }));
                });
            }
            else
                res.end(JSON.stringify(<IResponse>{ error: true, message: err.message }));
        });
    }

    /**
    * Gets projects based on the format of the request. You can optionally pass a 'search', 'index' and 'limit' query parameter.
    * @param {IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    getProjects(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-projects");
        var that = this;
        var count = 0;

        var findToken: IProject = {};
        findToken.user = req.params.user;

        // Check for valid ID
        if (req.params.id)
            if (isValidID(req.params.id))
                findToken._id = new mongodb.ObjectID(req.params.id);
            else
                return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid object id" }));

        // Check for keywords
        if (req.query.search)
            findToken.name = <any>new RegExp(req.query.search, "i");

        // First get the count
        model.count(findToken).then(function (num)
        {
            count = num;
            return model.findInstances<IProject>(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));

        }).then(function (instances)
        {
            res.end(JSON.stringify(<ModepressAddons.IGetProjects> {
                error: false,
                count: count,
                message: `Found ${count} projects`,
                data: that.getSanitizedData(instances, req._verbose)
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}