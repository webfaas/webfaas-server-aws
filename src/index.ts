import { WebFaaS, Core } from "@webfaas/webfaas";
import { SendMessageAPIGatewayProxy } from "./lib/aws/SendMessageAPIGatewayProxy";

const faas: WebFaaS = new WebFaaS();
const core: Core = faas.getCore();

//
//INIT STATIC LOAD PLUGINS
//
const Plugin_packageregistryrouting = require("@webfaas/webfaas-plugin-packageregistryrouting").default;
const plugin_packageregistryrouting = new Plugin_packageregistryrouting(core);
faas.getPluginManager().addPlugin(plugin_packageregistryrouting);

const Plugin_packageregistry_npm = require("@webfaas/webfaas-plugin-packageregistry-npm").default;
const plugin_packageregistry_npm = new Plugin_packageregistry_npm(core);
faas.getPluginManager().addPlugin(plugin_packageregistry_npm);

const Plugin_packageregistry_github = require("@webfaas/webfaas-plugin-packageregistry-github").default;
const plugin_packageregistry_github = new Plugin_packageregistry_github(core);
faas.getPluginManager().addPlugin(plugin_packageregistry_github);
//
//END STATIC LOAD PLUGINS
//

var faasStarted: Boolean = false;

process.on("exit", () => {
    if (faas){
        faas.stop();
    }
});

const sendMessageAPIGatewayProxy = new SendMessageAPIGatewayProxy(core);

exports.handler = async (event: any, context: any) => {
    if (!faasStarted){
        await faas.start();
        faasStarted = true;
    }
    
    var result: any = null;
    if (event.path){
        result = await sendMessageAPIGatewayProxy.processRequest(event, context);
    }
    return result;
};