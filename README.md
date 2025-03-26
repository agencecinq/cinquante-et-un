# Cinquante et un

## Description

Cinquante et un is a Shopify theme that is designed to be simple and easy to use. It is a minimalist theme that is perfect for small businesses and startups. The theme is fully responsive and looks great on all devices.

## Features

## Installation

To install Cinquante et un, follow these steps:

```bash
yarn install
```
Setup your shopify.theme.toml file with your store information.

Password came from Theme Access app.

Setup theses for each environment you want to work on.

```toml
[development]
store = "your-store.myshopify.com"
password = "your-password"
```

```toml
[production]
store = "your-store.myshopify.com"
password = "your-password"
```      

And so on.

If your environment is protected by a password, you can add it to the shopify.theme.toml file.

```toml
[development]
store = "your-store.myshopify.com"
password = "your-password"
store-password = "your-store-password"
```
> See [https://shopify.dev/docs/storefronts/themes/tools/cli/environments](https://shopify.dev/docs/storefronts/themes/tools/cli/environments) for more information.

Then run:

```bash
yarn dev
```

When you are ready to deploy your theme, run:

```bash
yarn deploy:dev
```

## Contributing

