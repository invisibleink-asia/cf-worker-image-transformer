/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch( request, env, ctx ) {
    // let cache = caches.default;

    // const cacheKey = new Request(request.url, request);

    // let response = await cache.match(cacheKey);

    // if ( !response ) {
    //   response = await handleRequest(request, env);
    // }

    let response = await handleRequest(request, env);

    const newResponse = new Response(response.body, response);

    console.log({
      'image_response': response,
    })

    newResponse.headers.append( "x-workers-hello", "WP63" );
    newResponse.headers.append( "Cache-Control", "86400" );
    // newResponse.headers.set( "Content-Type", "86400" );

    return newResponse;
  },
};

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request, env) {
  // Parse request URL to get access to query string
  const url = new URL(request.url);
  const options = {};

  url.hostname = env.IMG_HOST;

  if ( !/\.(jpg|jpeg|png|gif|webp|ico)$/i.test(url.pathname) ) {
    return fetch( url.toString() , {
      cacheTtl: 86400,
      cacheEverything: true,
    });
  }

  const pathFragments = url.pathname.split('/');
  const filename = String( pathFragments.slice(-1) );
  const regex = /(-([0-9]*)x([0-9]*)).[A-z]*$/g;
  const dimension = regex.exec(filename);

  if ( dimension !== null ) {
    pathFragments[pathFragments.length - 1] = filename.replace(dimension[1], '');
  }

  url.pathname = pathFragments.join('/');

  console.log(`path: ${url.pathname}`)

  // Cloudflare-specific options are in the cf object.
  options.cacheTtl = 86400;
  options.cacheEverything = true;
  options.cf = {
    image: {}
  };

  options.cf.image.quality = 90;

  if ( dimension ) {
    options.cf.image.width = dimension[2];
    options.cf.image.height = dimension[3];
  }

  const accept = request.headers.get("Accept");

  if ( /image\/avif/.test(accept) ) {
    options.cf.image.format = 'avif';
  } else if ( /image\/webp/.test(accept) ) {
    options.cf.image.format = 'webp';
  }

  const imageURL = url.toString();

  console.log(`target ${imageURL}`)
  console.log(`convert to ${options.cf.image.format}`)

  const imageRequest = new Request( imageURL, {
    headers: request.headers
  } );

  return fetch(imageRequest, options);
}
