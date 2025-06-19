# Render Deployment Checklist

## 1. Set Environment Variables
- Go to your Render dashboard > Environment > Add Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy values from your Supabase project settings.

## 2. Run Database Migrations
- Ensure your Supabase instance is migrated using the SQL files in `supabase/migrations/`.

## 3. Static Assets
- Make sure all images and files needed by your app are in the `public/` directory.

## 4. Unimplemented Features
- `/api/wallet/add-bank-account` is not implemented. Hide or disable related UI until ready.

## 5. Build & Start Commands
- Build: `npm run build` or `pnpm build`
- Start: `npm start` or `pnpm start`

## 6. Troubleshooting
- If you see a 501 error for add-bank-account, the feature is not yet implemented.
- If you see Supabase errors, check your environment variables. 