# Backend Learning Notes

## Day 1 — HTTP Request/Response Cycle

**Core idea:** Flip your mental model. On the frontend you _send_ requests and _read_ responses. On the backend you _read_ requests and _build_ responses.

- `req` — everything the client sent to us: method, headers, body, params
- `res` — what we send back: status code, headers, body
- `express.json()` — middleware that parses the raw request body into `req.body`. Without it, `req.body` is always undefined even when the client sends JSON.
- Each HTTP method needs its own route. GET and POST on the same URL `/hello` are two different routes.

**Security note:** Never log `req.headers` in full in production — it exposes cookies and session tokens.

---

## Day 2 — HTTP Methods

**Core idea:** Methods aren't arbitrary — they encode intent. Breaking the contract breaks caching, proxies, and client assumptions.

| Method | Meaning                       |
| ------ | ----------------------------- |
| GET    | Read only, never changes data |
| POST   | Creates something new         |
| PUT    | Replaces entirely             |
| PATCH  | Updates partially             |
| DELETE | Removes it                    |

**Status codes:**

- `201` — success AND something new was created (more precise than 200)
- `204` — success but nothing to return (used for DELETE)

**Always parseInt route params** — URL params come in as strings. `:id` is `"1"` not `1`. `1 === "1"` is false in JS so your `.find()` silently fails. Always parse and validate:

```js
const id = parseInt(req.params.id);
if (isNaN(id)) return res.status(400).json({ error: "id must be a number" });
```

**Frontend validation ≠ backend validation**

- Frontend validation = good UX
- Backend validation = security and data integrity
- Never assume the frontend handled it. Anyone can bypass the UI and hit your API directly with curl. Always validate on the server, no matter what.

---

## Day 3 — Status Codes

**Core idea:** Status codes communicate intent. They tell the client what happened
and tell you where to look when debugging.

**The ranges:**

- `2xx` — success
- `4xx` — client's fault. Check the request.
- `5xx` — server's fault. Check the server code.

**Codes you'll use every day:**

| Code | When to use                                                        |
| ---- | ------------------------------------------------------------------ |
| 200  | Standard success                                                   |
| 201  | Success + something new was created                                |
| 204  | Success + nothing to return (DELETE)                               |
| 400  | Missing fields, wrong types, malformed request                     |
| 401  | Not logged in — who are you?                                       |
| 403  | Logged in but not allowed — you can't access this                  |
| 404  | Resource doesn't exist                                             |
| 409  | Conflict — duplicate email, already exists                         |
| 422  | Validation failed — right type, wrong value (invalid email format) |
| 500  | Server crashed                                                     |

**401 vs 403 — the one everyone gets wrong:**

- 401 — I don't know who you are. Login first. (no wristband)
- 403 — I know who you are. You're just not allowed. (wristband but no backstage pass)

**400 vs 409 vs 422:**

- 400 — something wrong with the request shape (missing field, wrong type)
- 409 — request was fine but conflicts with existing data (duplicate email)
- 422 — request was fine but value is invalid (email field isn't a valid email)

**Security habit:** Always disable the X-Powered-By header in production.
It tells attackers what stack you're running.

```js
app.disable("x-powered-by");
```

**Never trust status codes from the client. You set them, always.**

---

## Day 4 — CORS & Request Headers

**Core idea:** CORS is a browser security rule, not a server rule.
The server just needs to send the right headers — the browser enforces it.

**How it works:**

1. Browser sees your frontend (localhost:5500) calling a different origin (localhost:5000)
2. Browser sends an `Origin` header with the request
3. Server responds with `Access-Control-Allow-Origin` header
4. Browser checks if they match — if yes, your code sees the response. If no, browser blocks it.

**Key insight:** The request reaches the server either way.
curl and Postman don't enforce CORS — only browsers do.
That's why your API works in Postman but breaks in the browser.

**What makes an origin different:**

- Different port: localhost:3000 vs localhost:5000
- Different protocol: http vs https
- Different domain: localhost vs myapi.com

**Setting up CORS in Express:**

```js
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // must match exactly
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

**Access-Control-Allow-Origin** — response header your server sends.
Tells the browser which origin is allowed to read the response.
If it doesn't match the request origin, the browser throws the response away.

**304 Not Modified** — not an error. The browser cached the response
and the server confirmed the data hasn't changed. Saves bandwidth.
You'll see 200 on first request, 304 on repeat requests with same data.

**Pro tip:** Never use `origin: '*'` in production — that allows
any website to call your API. Always whitelist specific origins.

---

## Day 5 — Body Parsing & Validation

**Core idea:** Never trust incoming data. Validate everything before
it touches your database. Same concept as frontend validation but the
purpose is different — frontend protects UX, backend protects data integrity.

**3 questions on every incoming request:**
1. Is the body parseable? (express.json() handles this)
2. Are required fields present?
3. Are the values the right shape/format?

**express.json()** — parses raw incoming bytes into a JS object and puts
it on req.body. Without it req.body is always undefined. Think of it as
automatic JSON.parse() that runs on every request.

**Validation pattern — collect all errors, not just the first:**
```js
function validateUser(data) {
  const errors = []
  if (!data.name) errors.push({ field: 'name', message: 'required' })
  if (!data.email) errors.push({ field: 'email', message: 'required' })
  return errors
}

if (errors.length > 0) {
  return res.status(422).json({ error: 'validation failed', details: errors })
}
```
Collecting all errors = user sees everything wrong at once.
Stopping at first = user has to submit multiple times to find all problems.

**400 vs 422:**
- 400 — malformed request, wrong type, can't be parsed
- 422 — right structure but invalid values (email missing @)

**The details array** — tells the frontend exactly which field failed
and why. Same pattern as React Hook Form errors, just from the server.
Frontend can use it to show field-level error messages.

**Common mistake:** Weak validation like checking for '@' in email.
Use a regex or validator.js in production. The pattern is right,
the implementation needs tightening.

---

## Day 6 — Error Handling

**Core idea:** Never let raw errors reach the client. One global error
handler catches everything. Client gets a safe message, server logs the full details.

**Express middleware order matters — top to bottom:**
1. Body parsing middleware
2. Routes
3. 404 handler (catches unmatched routes)
4. Global error handler (catches anything that called next(err))

**next() vs next(err):**
- `next()` — continue to the next middleware
- `next(err)` — skip everything, jump straight to the error handler

**Why the error handler has 4 arguments:**
Express identifies an error handler by its signature — exactly 4 arguments (err, req, res, next).
3 arguments = normal middleware. Express won't send errors to it.
The signature is what makes it special, not the position alone.

**asyncHandler — wraps async routes so you don't need try/catch everywhere:**
```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
```
Without it, async errors crash the server silently.
With it, any thrown error automatically calls next(err).
Think of it like a React error boundary but for routes.

**Custom error class — lets you attach a status code to any error:**
```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}
// usage
throw new AppError('user not found', 404)
```

**Global error handler pattern:**
```js
app.use((err, req, res, next) => {
  console.error(err)  // full details on server
  const statusCode = err.statusCode || 500
  const message = err.statusCode ? err.message : 'something went wrong'
  res.status(statusCode).json({ error: message })
})
```
- Known errors (AppError) → use their message and status code
- Unknown errors (500) → hide the real message, log it server side
- 500 errors are hidden because they may expose file paths, DB details,
  or internal logic that attackers could exploit

**Port conflicts** — if your server behaves unexpectedly, check if
another service is already running on that port.