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
    const response = await handleRequest(request, env);

    const newResponse = new Response(response.body, response);

    newResponse.headers.append(
      "x-workers-hello",
      "WP63"
    );

    return newResponse;
  },
};

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request, env) {
  // Parse request URL to get access to query string
  let imageURL = '';
  let options = {};

  if ( request.url === '/favicon.ico' ) {
    return request;
  } else {
    let url = new URL(request.url);
    let pathFragments = url.pathname.split('/');
    let filename = String( pathFragments.slice(-1) );

    let regex = /(-([0-9]*)x([0-9]*)).[A-z]*$/g;
    let dimension = regex.exec(filename);
    let realFilename = '';

    if ( dimension !== null ) {
      realFilename = dimension[1];

      pathFragments[pathFragments.length - 1] = filename.replace(dimension[1], '');
    }

    url.hostname = env.IMG_HOST;
    url.pathname = pathFragments.join('/');

    // return new Response( url.toString() );

    // Cloudflare-specific options are in the cf object.
    options = {
      cf: {
        image: {}
      },
      cacheTtl: 86400,
      cacheEverything: true,
    };

    options.cf.image.quality = 85;

    if ( dimension ) {
      options.cf.image.width = dimension[2];
      options.cf.image.height = dimension[3];
    }

    // Your Worker is responsible for automatic format negotiation. Check the Accept header.
    const accept = request.headers.get("Accept");

    if (/image\/avif/.test(accept)) {
      options.cf.image.format = 'avif';
    } else if (/image\/webp/.test(accept)) {
      options.cf.image.format = 'webp';
    }

    // Get URL of the original (full size) image to resize.
    // You could adjust the URL here, e.g., prefix it with a fixed address of your server,
    // so that user-visible URLs are shorter and cleaner.
    imageURL = url.toString();

    try {
      // TODO: Customize validation logic
      const { pathname } = new URL(imageURL);

      // Optionally, only allow URLs with JPEG, PNG, GIF, or WebP file extensions
      // @see https://developers.cloudflare.com/images/url-format#supported-formats-and-limitations

      if (!/\.(jpg|jpeg|png|gif|webp|ico)$/i.test(pathname)) {
        // return new Response('Disallowed file extension', { status: 400 })
        return request;
      }
    } catch (err) {
      return new Response('Invalid "image" value', { status: 404 });
    }
  }

  // Build a request that passes through request headers
  const imageRequest = new Request(imageURL, {
    headers: request.headers
  })

  // Returning fetch() with resizing options will pass through response with the resized image.
  return fetch(imageRequest, options);
}
