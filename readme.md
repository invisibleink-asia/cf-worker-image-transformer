# Cloudflare Worker for WordPress Cloudflare Image Transformers

Duplicate `wrangler.example.toml` and replace worker name and `IMG_HOST` before deploy.

Then you find your ways to replace exists image url hostname with worker's hostname. Path structure would be the same.

* To create Cloudflare Worker please [follow this guide](https://developers.cloudflare.com/workers/get-started/guide/)
* You should predefine Image Variants for each size exists on your website. please [follow this guide](https://developers.cloudflare.com/images/manage-images/create-variants/)

# How I set up this thing

I use Cloudways as WordPress hosting. I added two domains for my website. for example:
- jirayu.in.th
- web.jirayu.in.th

In `wrangler.toml` I set `IMG_HOST` to secondary domain name
```
[vars]
IMG_HOST = "web.jirayu.in.th"
```

After I deploy this worker onto Cloudflare, then I set Workers Routes to `https://jirayu.in.th/wp-content/upload/*` and choose to run this worker.

Why I setup like this? Once the worker route is set to `https://jirayu.in.th/wp-content/upload/*` it will occupy this route. So if this worker send a request to existing image, it will cause infinite request loop. So I add new domain `web.jirayu.in.th` as an  entry point for this worker.

And don't forget to turn-on Hotlink Protection (Scrape Shield) and set configuration rule to allow hotlink from your domain name.
