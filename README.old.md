This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, ensure you have a `.env.development.local` file with the following environment variables:

* `NEXT_PUBLIC_API_URL`: Root URL of the Skip API server the frontend will query. The two acceptable values are: 
    * `https://api.skip.money/v1`: The stable, production API server
    * `https://solve-dev.skip.money/v1`: The nightly, unstable dev server used for testing and previewing new functionality
(An example has been included in the repo under example.env). You *MUST* copy this to `env.development.local`. Internally, we use `env.development.local` to develop against the nightly API and `env.production.local` to develop against the stable one. 

## Develop

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Build and Run

```bash
npm run build && npm run start
# or
yarn build && yarn start
# or 
pnpm build && pnpm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
