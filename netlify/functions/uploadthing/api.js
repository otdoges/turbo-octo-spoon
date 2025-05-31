const { createRouteHandler } = require("uploadthing/server");
const { uploadthing } = require("./router");

// Create the UploadThing API handler for Netlify functions
const { GET, POST } = createRouteHandler({
  router: uploadthing,
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
    isDev: process.env.NODE_ENV === "development"
  }
});

// Convert Netlify event to a format compatible with UploadThing handlers
function adaptNetlifyEventForUploadThing(event) {
  // Create a Request object that UploadThing expects
  const url = new URL(event.path, `https://${event.headers.host || 'localhost'}`);
  
  // Add query parameters
  if (event.queryStringParameters) {
    Object.entries(event.queryStringParameters).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  // Create headers object
  const headers = new Headers();
  for (const [key, value] of Object.entries(event.headers)) {
    headers.append(key, value);
  }
  
  // Create request object
  return new Request(url.toString(), {
    method: event.httpMethod,
    headers,
    body: event.body ? (
      event.isBase64Encoded 
        ? Buffer.from(event.body, 'base64') 
        : event.body
    ) : null
  });
}

// Convert UploadThing response to Netlify format
function adaptResponseForNetlify(response) {
  return response.text().then(text => {
    let body = text;
    let isBase64Encoded = false;
    
    // Handle binary responses if needed
    if (response.headers.get('content-type')?.includes('application/octet-stream')) {
      body = Buffer.from(text).toString('base64');
      isBase64Encoded = true;
    }
    
    // Create Netlify-compatible response
    const netlifyResponse = {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      isBase64Encoded
    };
    
    return netlifyResponse;
  });
}

// Export the Netlify function handler
exports.handler = async function(event, context) {
  try {
    // Adapt the event for UploadThing
    const adaptedRequest = adaptNetlifyEventForUploadThing(event);
    
    // Route the request to the appropriate handler based on method
    let response;
    if (event.httpMethod === "GET") {
      response = await GET(adaptedRequest);
    } else if (event.httpMethod === "POST") {
      response = await POST(adaptedRequest);
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }
    
    // Convert response back to Netlify format
    return await adaptResponseForNetlify(response);
  } catch (error) {
    console.error("UploadThing API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process upload request",
        message: error.message
      })
    };
  }
}; 