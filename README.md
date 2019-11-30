# Python Sandbox

This is an online python playground built with Javascript, Bulma CSS, Docker, and Python 3. Built to run on Ubuntu 18.04, but it'll run on anything, really.

## Setup

- Run `setup.sh` to install dependencies (configured for Ubuntu 18.04)
- Create a virtual environment
- Install flask, gunicorn, and the python docker library in the virtual environment
- Run `start-gunicorn.sh` to run
- Download nginx, set up with config shown below
- Copy files from `sever/static/` into `/var/www/html/`
- Download Let's Encrypt certbot, set up certificate

## Nginx configuration

```nginx
	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}

	location /hello {
		proxy_pass http://localhost:8000/hello;
	}

	location /run {
		proxy_pass http://localhost:8000/run;
```
