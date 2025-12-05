# flexible-http

HTTP and HTTPS event source for the Flexible framework.

## Installation

```bash
npm install flexible-http flexible-core
```

## Quick Start

```typescript
import { HttpModuleBuilder } from "flexible-http";
import { FlexibleAppBuilder } from "flexible-core";

// Create HTTP event source
const httpEventSource = HttpModuleBuilder.instance
    .withPort(8080)
    .build();

// Create app
const application = FlexibleAppBuilder.instance
    .addEventSource(httpEventSource)
    .addFramework(yourFramework)
    .createApp();

// Start server
await application.run();
```

## HTTPS Support

```typescript
import { HttpModuleBuilder } from "flexible-http";
import * as fs from 'fs';

const credentials = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

const httpsEventSource = HttpModuleBuilder.instance
    .withPort(8443)
    .withCredentials(credentials)
    .build();
```

## Features

### Request Lifecycle Logging

flexible-http includes built-in request logging with unique request IDs:

```
[1701234567890-1-a3f2] HTTP GET /api/users - Client: 192.168.1.100
[1701234567890-1-a3f2] Handler completed in 12ms - 1 response(s)
[1701234567890-1-a3f2] Response sent - Status: 200
```

### X-Request-ID Header Propagation

If a client sends an `X-Request-ID` header, it will be used throughout the request lifecycle:

```bash
curl -H "X-Request-ID: my-trace-id" http://localhost:8080/api
```

This is useful for:
- Distributed tracing across microservices
- Correlating logs between services
- End-to-end request tracking

### Security

The logging system is designed with security in mind:

✅ **Logged:**
- HTTP method and path
- Client IP address
- Status code
- Request duration

❌ **NOT logged:**
- Request/response bodies
- Query parameters
- Headers (except X-Request-ID)
- Cookies or authentication tokens

### Health Checks

HTTP sources implement the optional `healthCheck()` method:

```typescript
const httpSource = HttpModuleBuilder.instance.withPort(8080).build();

// Check if HTTP server is healthy
const health = await httpSource.healthCheck();
// { healthy: true, details: { port: 8080, connections: 5 } }
```

You can expose this as an endpoint:

```typescript
@Controller({ filter: HttpMethod })
export class HealthController {
  constructor(private app: FlexibleApp) {}

  @Route(HttpGet, { path: '/health' })
  async health() {
    const sources = this.app.getEventSources();
    const health = await Promise.all(
      sources.map(s => s.healthCheck?.())
    );

    return {
      status: health.every(h => h?.healthy) ? 'healthy' : 'unhealthy',
      sources: health
    };
  }
}
```

## Configuration

### Custom Port

```typescript
const httpEventSource = HttpModuleBuilder.instance
    .withPort(3000)
    .build();
```

### Custom Express App

```typescript
import express from 'express';

const app = express();
// Configure your express app...

const httpEventSource = HttpModuleBuilder.instance
    .withApplication(app)
    .withPort(8080)
    .build();
```

## Testing

For testing, you can use the HTTP source with a test port:

```typescript
import { HttpModuleBuilder } from "flexible-http";
import { DummyFramework } from "flexible-core";

describe("My HTTP Tests", () => {
  let app;

  beforeEach(async () => {
    const httpSource = HttpModuleBuilder.instance
      .withPort(3001)  // Test port
      .build();

    app = FlexibleAppBuilder.instance
      .addEventSource(httpSource)
      .addFramework(new DummyFramework())
      .createApp();

    await app.run();
  });

  afterEach(async () => {
    await app.stop();
  });

  it("should handle requests", async () => {
    const response = await fetch("http://localhost:3001/test");
    expect(response.status).toBe(200);
  });
});
```

## Production Deployment

### Behind a Load Balancer

When deploying behind a load balancer (nginx, HAProxy, AWS ALB), configure it to:

1. **Forward client IP:**
   ```nginx
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   ```

2. **Health check endpoint:**
   ```nginx
   location /health {
     proxy_pass http://flexible_app/health;
   }
   ```

3. **Graceful shutdown:**
   - Deregister from load balancer first
   - Then call `app.stop()` to finish in-flight requests

### Environment Variables

```typescript
const port = process.env.PORT || 8080;
const httpSource = HttpModuleBuilder.instance
  .withPort(port)
  .build();
```

## Troubleshooting

### Port Already in Use

If you get `EADDRINUSE` error, another process is using the port:

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Self-Signed Certificate Warnings

For HTTPS with self-signed certificates in development:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm test
```

**⚠️ Never use this in production!**

## Related Packages

- [flexible-core](https://github.com/ftacchini/flexible-core) - Core framework
- [flexible-decorators](https://github.com/ftacchini/flexible-decorators) - Decorator-based routing
- [flexible-use-cases](https://github.com/ftacchini/flexible-use-cases) - Use case pattern support

## License

ISC
