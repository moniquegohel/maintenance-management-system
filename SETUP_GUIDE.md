# GearGuard - Setup & Authentication Guide

## Quick Start: Creating Test Users

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** > **Users** in the left sidebar

### Step 2: Create Test Users
Click **"Add user"** or **"Invite"** button and create test accounts with the following credentials:

#### Example Test Users:

**Admin User:**
- Email: `admin@geargard.demo`
- Password: `DemoPassword123!`
- Role: Admin (you can manage roles in your app settings)

**Technician User:**
- Email: `technician@geargard.demo`
- Password: `DemoPassword123!`
- Role: Technician

**Manager User:**
- Email: `manager@geargard.demo`
- Password: `DemoPassword123!`
- Role: Manager

### Step 3: Login to GearGuard
1. Go to your GearGuard application login page
2. Enter any email/password combination you created in Supabase
3. Click "Sign In"
4. You'll be redirected to the Dashboard

## Environment Variables Required

Make sure these environment variables are set in your Vercel project:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

These are automatically added when you connect Supabase through the v0 Connections panel.

## How Authentication Works

### Login Flow:
1. User enters email and password on the login page
2. Supabase validates credentials
3. If valid, a session is created and stored in cookies
4. User is redirected to the Dashboard
5. All subsequent requests include the session in the cookie header
6. The `proxy.ts` middleware verifies the session and grants access

### Protected Routes:
All routes except `/auth/*` and `/api/*` require authentication. If you try to access the dashboard without logging in, you'll be redirected to the login page.

### Logout:
Click the logout button in the top-right navbar to sign out. You'll be redirected to the login page.

## Adding More Users Later

You can add more users anytime through:
1. **Supabase Dashboard**: Authentication > Users > Add user
2. **App-based signup** (if you add a signup page): Users can self-register

## Troubleshooting

### "Invalid login credentials"
- Double-check the email and password match what you created in Supabase
- Make sure the user is confirmed (check the User list in Supabase)

### "Cannot access dashboard"
- Clear browser cookies and try logging in again
- Verify environment variables are correctly set
- Check that Supabase integration is connected in v0

### Environment Variables Not Working
- Go to your Vercel project settings
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Redeploy after adding/updating variables

## Database RLS (Row Level Security)

The system uses RLS policies to ensure users only see their company's data. When creating test users, they'll have access to all data by default (suitable for testing).

For production, implement proper team/company assignment logic in the RLS policies.
