# Cloudflare Worker for WordPress Cloudflare Image Transformers

Duplicate `wrangler.example.toml` and replace worker name and `IMG_HOST` before deploy.

Then you find your ways to replace exists image url hostname with worker's hostname. Path structure would be the same.

* To create Cloudflare Worker please [follow this guide](https://developers.cloudflare.com/workers/get-started/guide/)
* You should predefine Image Variants for each size exists on your website. please [follow this guide](https://developers.cloudflare.com/images/manage-images/create-variants/)
