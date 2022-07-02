# Temperature Blanket

## Development

```
# boot dev server
netlify dev
# or
ntl dev
```

development port 8000 (see `netlify.toml`)



### TODO
- short API url
```
# netlify.toml

[[redirects]]
  from = "/server/*"
  to = "/.netlify/functions/:splat"
  status = 200
```
- validation
- toast messages
- loader