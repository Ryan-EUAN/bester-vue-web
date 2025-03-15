export async function onRequest(context) {
    return new Response(`请求地址${context.params.id}`);
    // console.log(`请求地址${context.params.id}`);

    // const { request } = context;
    // const response = await context.next();

    // // 设置 CORS 头
    // response.headers.set("Access-Control-Allow-Origin", "http://123.60.24.41:8888");
    // response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    // response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // response.headers.set("Access-Control-Allow-Credentials", "true");

    // // 处理 OPTIONS 预检请求
    // if (request.method === "OPTIONS") {
    //     return new Response(null, { headers: response.headers });
    // }

    // return response;
}