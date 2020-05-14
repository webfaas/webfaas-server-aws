"use strict";

const aws_lambda = require("../index");
import { APIGatewayProxyEvent, Context } from "aws-lambda";

(async function(){
    try {
        let event = {} as APIGatewayProxyEvent;
        event.path = "@webfaaslabs/math:sum/1.0.0";
        event.body = JSON.stringify({x:2,y:3});
        event.headers = {"content-type": "application/json"};

        let context = {} as Context;
        context.awsRequestId = "001";
        
        var response: any = await aws_lambda.handler(event, context);

        console.log("response => ", response);
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();