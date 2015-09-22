var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mongodb = require("mongodb");
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var PluginModel_1 = require("../new-models/PluginModel");
var winston = require("winston");
/**
* A controller that deals with plugin models
*/
var PluginController = (function (_super) {
    __extends(PluginController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PluginController(server, config, e) {
        _super.call(this, [new PluginModel_1.PluginModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/:id?", [this.getPlugins.bind(this)]);
        router.post("/create", [modepress_api_1.isAdmin, this.create.bind(this)]);
        router.put("/update/:id", [modepress_api_1.isAdmin, this.update.bind(this)]);
        // Register the path
        e.use("/app-engine/plugins", router);
    }
    /**
    * Updates a plugin with new details
    * @param {IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PluginController.prototype.update = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var pluginToken = req.body;
        model.update({ _id: new mongodb.ObjectID(req.params.id) }, pluginToken).then(function (data) {
            res.end(JSON.stringify({
                error: false,
                message: "Plugin Updated"
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Gets plugins based on the format of the request
    * @param {IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PluginController.prototype.create = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var pluginToken = req.body;
        // Create the new plugin
        model.createInstance(pluginToken).then(function (instance) {
            res.end(JSON.stringify({
                error: false,
                message: "Created new plugin '" + pluginToken.name + "'",
                data: that.getSanitizedData(instance.schema.generateCleanData(false, instance._id), false)
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Gets plugins based on the format of the request
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PluginController.prototype.getPlugins = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var count = 0;
        var findToken = {};
        var getContent = true;
        if (req.query.minimal)
            getContent = false;
        // Check for keywords
        if (req.query.search)
            findToken.name = new RegExp(req.query.search, "i");
        // First get the count
        model.count(findToken).then(function (num) {
            count = num;
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));
        }).then(function (instances) {
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " plugins",
                data: that.getSanitizedData(instances, true)
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return PluginController;
})(modepress_api_1.Controller);
exports.PluginController = PluginController;
