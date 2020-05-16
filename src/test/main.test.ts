import * as chai from "chai";
import { APIGatewayProxyEvent, Context } from "aws-lambda";

const mainIndex = require("../index");

describe("Handler", () => {
    it("content-type empty - @webfaaslabs/math:sum/1.0.0", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.headers = {};
        event.path = "@webfaaslabs/math:sum/1.0.0";
        event.body = JSON.stringify({x:2,y:3});
        
        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json");
    })

    it("content-type empty - body empty", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.headers = {};
        event.path = "@webfaaslabs/math:sum/1.0.0";
        
        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(500);
        chai.expect(response.headers["content-type"]).to.eq("application/json");
    })

    //
    //application/json
    //
    it("application/json - @webfaaslabs/math:sum/1.0.0", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "@webfaaslabs/math:sum/1.0.0";
        event.body = JSON.stringify({x:2,y:3});
        event.headers = {"content-type": "application/json"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json");
        let body = JSON.parse(response.body.toString());
        chai.expect(body).to.eq(5);
    })

    it("application/json - NOTFOUND", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "@webfaaslabs/__NOTFOUND__:sum/1.0.0";
        event.body = JSON.stringify({x:2,y:3});
        event.headers = {"content-type": "application/json"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(404);
        chai.expect(response.headers["content-type"]).to.eq("application/json");
    })

    it("application/json - PARSE ERROR", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "@webfaaslabs/math:sum/1.0.0";
        event.body = "{]]//";
        event.headers = {"content-type": "application/json"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(400);
        chai.expect(response.headers["content-type"]).to.eq("text/plain");
    })

    it("application/json - @webfaaslabs/math:sum/1.0.0", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "@webfaaslabs/math:sum/1.0.0";
        event.body = JSON.stringify({x:2,y:3});
        event.headers = {"content-type": "application/json"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json");
        let body = JSON.parse(response.body.toString());
        chai.expect(body).to.eq(5);
    })

    it("application/json - invalid request", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "@webfaaslabs";
        event.body = JSON.stringify({x:2,y:3});
        event.headers = {"content-type": "application/json"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(400);
        chai.expect(response.headers["content-type"]).to.eq("application/json");
    })

    //
    //application/json-rpc
    //
    it("application/json-rpc - @webfaaslabs/math:sum/1.0.0", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "";
        event.body = JSON.stringify({
            id:1,
            method:"@webfaaslabs/math:sum/1.0.0",
            params:{x:2,y:3}
        });
        event.headers = {"content-type": "application/json-rpc"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json-rpc");
        let body = JSON.parse(response.body.toString());
        chai.expect(body.id).to.eq(1);
        chai.expect(body.result).to.eq(5);
    })

    it("application/json-rpc - NOTFOUND", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "";
        event.body = JSON.stringify({
            id:2,
            method:"@webfaaslabs/__NOTFOUND__:sum/1.0.0",
            params:{x:2,y:3}
        });
        event.headers = {"content-type": "application/json-rpc"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json-rpc");
        let body = JSON.parse(response.body.toString());
        chai.expect(body.id).to.null;
        chai.expect(body.error.code).to.eq(-32601);
    })

    it("application/json-rpc - PARSE ERROR", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "";
        event.body = "{]]//";
        event.headers = {"content-type": "application/json-rpc"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json-rpc");
        let body = JSON.parse(response.body.toString());
        chai.expect(body.id).to.null;
        chai.expect(body.error.code).to.eq(-32600);
    })

    it("application/json-rpc - invalid request", async function(){
        let event = {} as APIGatewayProxyEvent;
        event.path = "";
        event.body = JSON.stringify({
            id:1,
            method:"@webfaaslabs",
            params:{x:2,y:3}
        });
        event.headers = {"content-type": "application/json-rpc"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        let response: any = await mainIndex.handler(event, context);

        chai.expect(response.statusCode).to.eq(200);
        chai.expect(response.headers["content-type"]).to.eq("application/json-rpc");
        let body = JSON.parse(response.body.toString());
        chai.expect(body.id).to.null;
        chai.expect(body.error.code).to.eq(-32600);
    })
})