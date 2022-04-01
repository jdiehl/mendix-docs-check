### Update Docs

```
node .
```

### Update Docs (Fresh)

```
rm docs.json
node .
rm -rf ../docs/content/howto/mobile
rm -rf ../docs/content/refguide/mobile
cp -R mobile ../docs/content/
```