# Secret keys in the front end

```text
Check my project for secret keys that end up in the browser. That includes anything in VITE_*, NEXT_PUBLIC_* or REACT_APP_* variables, or imported into client code:
- OpenAI (sk-...), Anthropic (sk-ant-...), Stripe secret keys (sk_live_, rk_live_);
- the Supabase service_role key, and any other key the provider calls secret.
Publishable keys (Stripe pk_, the Supabase anon key, Firebase web config) are public on purpose. Leave them.
For every secret key you find:
1. Tell me where it is, without printing the key.
2. Move the API call to a server function (an API route, edge function or serverless function), and keep the key in a server-only environment variable. The server function must not become an open proxy to the paid API or to data: check that the user is allowed to make the request, validate the input, allow only the exact operation the app needs, and add a usage limit. Never expose the Supabase service_role key through it. Prefer the anon key with row-level security for user data.
3. Remind me to rotate (replace) the key with the provider, because the old one has already been public. Do not try to rotate it yourself, and do not say it was rotated: only I can confirm that.
4. Then build the app and search the built client files (for example dist/ or .next/static) for each secret key prefix you found, without printing the values. Test the feature that used the key, and check access: protected operations must reject requests from users who are not allowed to make them, and any function that is public on purpose must have the operation and spending limits I agreed to. A rate limit alone does not replace the permission check.
5. Report what you checked and what you could not check.
Show me the plan first and wait for my OK.
```
