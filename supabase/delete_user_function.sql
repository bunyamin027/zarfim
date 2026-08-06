-- Zarfım: Account Deletion RPC Function
-- Run this in Supabase Dashboard → SQL Editor
--
-- This function allows authenticated users to delete their own account.
-- It uses SECURITY DEFINER to execute with elevated privileges,
-- which is required to delete from auth.users.

-- First, delete any existing version of this function
DROP FUNCTION IF EXISTS delete_user();

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's application data (order matters for foreign keys)
  DELETE FROM transactions WHERE user_id = current_user_id;
  DELETE FROM envelopes WHERE user_id = current_user_id;
  DELETE FROM household_members WHERE user_id = current_user_id;
  DELETE FROM households WHERE owner_id = current_user_id;
  DELETE FROM subscriptions WHERE user_id = current_user_id;
  DELETE FROM users WHERE id = current_user_id;
  
  -- Finally, delete the auth user record
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
