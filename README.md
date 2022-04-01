### Update Docs

```
node .
```

### Update Docs (Fresh)

```
rm docs.json
node .
rm -rf ../docs/content/en/docs/howto/mobile
rm -rf ../docs/content/en/docs/refguide/mobile
cp -R mobile ../docs/content/en/docs/refguide/
```