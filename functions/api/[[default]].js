export async function onRequest({ request }) {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    const url = new URL(request.url);
    // console.log('查看日志', url.search);
    const res = await fetch(`http://123.60.24.41${url.pathname}${url.search}`, {
        method: request.method,
        headers: reqHeaders,
        body: request.body,
    });


    const resHeaders = new Headers(res.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(res.body, {
        headers: resHeaders,
    });
}