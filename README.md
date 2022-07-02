# Temperature Blanket

## Development:

### - Create `.env` in root folder
``` sh
# replace values for AirTable base
# see https://airtable.com/api
AIRTABLE_API_KEY=value
AIRTABLE_BASE_ID=value
AIRTABLE_TABLE_NAME=value
```

### - install dependences
``` sh
npm install
```

### - boot server
``` sh
netlify dev
ntl dev
```

### - test
``` sh
curl localhost:8000/.netlify/functions/api/colors
```


<br>

## Config `netlify.toml`:
see `netlify.toml` for configurations about project

- development port 8000
- publish dir for static files

<br>

## Resources:
- https://docs.netlify.com/configure-builds/file-based-configuration/
- https://explorers.netlify.com/learn/up-and-running-with-serverless-functions

<br>

### TODO
- short API url
```
# netlify.toml

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```
- validation
- toast messages
- loader