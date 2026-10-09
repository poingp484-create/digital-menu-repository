# Product imagery

Drop real product photos / renders here, then point the product at it in
`src/data/products.js`:

```js
image: 'products/kira-chrome-jacket.png',
```

Leave `image: ''` to keep the procedural placeholder render.

Recommended: transparent PNG or WebP, product isolated, ~1600px on the long edge,
consistent lighting (key light from the left).

| Type    | Aspect          | Example file name              |
|---------|-----------------|--------------------------------|
| Jackets | 4:5 portrait    | `kira-chrome-jacket.png`       |
| Tees    | 4:5 portrait    | `yakuza-core-tee.png`          |
| Shoes   | 10:7 landscape  | `yk-01-chrome-runner.png`      |
| Jewelry | 1:1 square      | `yakuza-chain.png`             |

The featured piece (`FEATURED` in the same file) is also used as the WebGL
texture the camera flies toward at the end of the hero.
