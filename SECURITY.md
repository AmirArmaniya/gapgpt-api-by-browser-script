# SECURITY

This project is an educational/demonstration tool that uses an authenticated browser session to provide a local API.

Reporting a vulnerability
- Please open an issue on this repository or contact the maintainer at the GitHub profile listed in the README.

Security considerations / warnings
- This software relies on your browser session for access to GapGPT. Do not run this on an environment you do not control.
- Do not expose the local API to the public internet without proper authentication and auditing — the server has no built-in auth.
- Requests proxied through this software will be processed by the GapGPT web UI under your account — be aware of rate limits and ToS implications.

Responsible disclosure
- If you believe you have discovered a security vulnerability, please open a private issue or contact the maintainer and do not publish details publicly until a fix is available.
