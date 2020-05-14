import { Log, Core, MessageUtil, WebFaasError, IMessage } from "@webfaas/webfaas-core";
import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from "aws-lambda";
import { JsonRpcErrorTypeEnum } from "@webfaas/webfaas-core/lib/Util/MessageUtil";

type headers = {
    [header: string]: boolean | number | string
};

export class SendMessageAPIGatewayProxy {
    private log: Log;
    private core: Core;
    
    constructor(core: Core){
        this.core = core;
        this.log = core.getLog();
    }

    buildHeaders(contentType?: string): headers{
        var headers: headers = {};

        headers["server"] = "webfaas";
        headers["content-type"] = contentType || "text/plain";

        return headers;
    }

    processRequest(event: APIGatewayProxyEvent, context: Context) {
        return new Promise((resolve, reject) => {
            let requestContentType: string = event.headers["content-type"] || "";
            let payload: any;
            let msg: IMessage | null;
            let result = {} as APIGatewayProxyResult;

            if (event.body){
                if (requestContentType === "application/json-rpc"){
                    try {
                        payload = MessageUtil.parseJsonRpcRequest(event.body);
                    }
                    catch (errTryParse) {
                        this.log.writeError("processRequest", errTryParse, undefined, __filename);

                        let responseJson = MessageUtil.parseJsonRpcResponseError(MessageUtil.convertErrorToCodeJsonRpc(errTryParse), errTryParse);
                        result.statusCode = 200;
                        result.headers = this.buildHeaders("application/json-rpc");
                        result.body = JSON.stringify(responseJson);
                        resolve(result);
                        return;
                    }
                }
                else if (requestContentType === "application/json"){
                    try {
                        payload = JSON.parse(event.body);
                    }
                    catch (errTryParse) {
                        this.log.writeError("processRequest", errTryParse, undefined, __filename);
                        
                        result.statusCode = 400;
                        result.headers = this.buildHeaders();
                        result.body = "Parse error";
                        resolve(result);
                        return;
                    }
                }
                else{
                    payload = event.body;
                }
            }
            else{
                payload = null;
            }
    
            if (requestContentType === "application/json-rpc"){
                msg = MessageUtil.parseMessageByPayloadJsonRpc(payload, "", event.httpMethod, event.headers);
            }
            else{
                msg = MessageUtil.parseMessageByUrlPath(event.path, "", payload, event.httpMethod, event.headers);
            }
            
            if (msg){
                let requestID: string | number = msg.header.messageID || MessageUtil.parseString(event.headers["X-Request-ID"]) || context.awsRequestId;
                msg.header.messageID = requestID;
                
                this.core.sendMessage(msg).then((msgResponse) => {
                    if (requestContentType === "application/json-rpc"){
                        
                        let responseJsonRpc: any;
                        
                        if (msgResponse){
                            responseJsonRpc = MessageUtil.parseJsonRpcResponseSuccess(msgResponse.payload, requestID);
                        }
                        else{
                            responseJsonRpc = MessageUtil.parseJsonRpcResponseSuccess(null, requestID);
                        }

                        result.statusCode = 200;
                        result.headers = this.buildHeaders("application/json-rpc");
                        result.body = JSON.stringify(responseJsonRpc);
                    }
                    else{
                        let chunk: any;
                        let statusCode: number = 200;
                        let headers = this.buildHeaders("application/json");
                        if (msgResponse){
                            if (msgResponse.header && msgResponse.header.http){
                                if (msgResponse.header.http.statusCode){
                                    statusCode = msgResponse.header.http.statusCode;
                                }
                                if (msgResponse.header.http.headers){
                                    headers = msgResponse.header.http.headers;
                                }
                                if (msgResponse.header.http.contentType){
                                    headers["content-type"] = msgResponse.header.http.contentType;
                                }
                            }
                            
                            if (msgResponse.payload === undefined || msgResponse.payload === null){
                                chunk = undefined;
                                statusCode = 204; //No Content
                            }
                            else{
                                chunk = msgResponse.payload;
                                if (headers["content-type"] === "application/json" && !Buffer.isBuffer(chunk)){
                                    chunk = JSON.stringify(chunk);
                                }
                            }
                        }
                        else{
                            chunk = undefined;
                            statusCode = 204; //No Content
                        }
                        result.statusCode = statusCode;
                        result.headers = headers;
                        if (Buffer.isBuffer(chunk)){
                            result.body = chunk.toString("base64");
                            result.isBase64Encoded = true;
                        }
                        else{
                            result.body = chunk.toString();
                        }
                    }

                    resolve(result);
                }).catch((errSend)=>{
                    if (requestContentType === "application/json-rpc"){
                        let responseJson = MessageUtil.parseJsonRpcResponseError(MessageUtil.convertErrorToCodeJsonRpc(errSend), errSend);
                        result.statusCode = 200;
                        result.headers = this.buildHeaders("application/json-rpc");
                        result.body = JSON.stringify(responseJson);
                    }
                    else{
                        result.statusCode = MessageUtil.convertErrorToCodeHttp(errSend);
                        result.headers = this.buildHeaders("application/json");
                        result.body = JSON.stringify(errSend);
                    }
                    
                    this.log.writeError("processRequest", errSend, undefined, __filename);

                    resolve(result);
                });
            }
            else{
                if (requestContentType === "application/json-rpc"){
                    let responseJson = MessageUtil.parseJsonRpcResponseError(JsonRpcErrorTypeEnum.INVALID_REQUEST, new WebFaasError.SecurityError(WebFaasError.SecurityErrorTypeEnum.PAYLOAD_INVALID, "empty payload"));
                    result.statusCode = 200;
                    result.headers = this.buildHeaders("application/json-rpc");
                    result.body = JSON.stringify(responseJson);
                }
                else{
                    let errValidate = new WebFaasError.ValidateError("0", "", "Module name and version required");
                    result.statusCode = MessageUtil.convertErrorToCodeHttp(errValidate);
                    result.headers = this.buildHeaders("application/json");
                    result.body = JSON.stringify(errValidate);
                }
                resolve(result);
            }
        });
    }
}