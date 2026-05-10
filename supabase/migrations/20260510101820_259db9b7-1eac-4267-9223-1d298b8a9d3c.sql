-- Idempotency for webhook events
CREATE TABLE IF NOT EXISTS public.razorpay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.razorpay_events ENABLE ROW LEVEL SECURITY;

-- Unique constraint on order id (used by webhook + verify)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_payments_razorpay_order_id_key'
  ) THEN
    ALTER TABLE public.user_payments
      ADD CONSTRAINT user_payments_razorpay_order_id_key UNIQUE (razorpay_order_id);
  END IF;
END $$;

-- Atomic consume: returns true if user had quota and was incremented
CREATE OR REPLACE FUNCTION public.consume_generation(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit integer;
  v_used integer;
BEGIN
  -- Ensure plan row exists
  INSERT INTO public.user_plans (user_id, plan, generations_limit)
  VALUES (p_user_id, 'free', 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Ensure generations row exists
  INSERT INTO public.user_generations (user_id, generation_count)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT generations_limit INTO v_limit
  FROM public.user_plans WHERE user_id = p_user_id FOR UPDATE;

  UPDATE public.user_generations
  SET generation_count = generation_count + 1,
      updated_at = now()
  WHERE user_id = p_user_id
    AND generation_count < v_limit
  RETURNING generation_count INTO v_used;

  RETURN v_used IS NOT NULL;
END;
$$;

-- Refund a consumed generation (used when AI call fails after consume)
CREATE OR REPLACE FUNCTION public.refund_generation(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_generations
  SET generation_count = GREATEST(generation_count - 1, 0),
      updated_at = now()
  WHERE user_id = p_user_id;
$$;

-- Idempotent paid plan provisioning
CREATE OR REPLACE FUNCTION public.provision_plan(
  p_user_id uuid,
  p_plan text,
  p_limit integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan, generations_limit, updated_at)
  VALUES (p_user_id, p_plan, p_limit, now())
  ON CONFLICT (user_id)
  DO UPDATE SET plan = EXCLUDED.plan,
                generations_limit = EXCLUDED.generations_limit,
                updated_at = now();

  INSERT INTO public.user_generations (user_id, generation_count, updated_at)
  VALUES (p_user_id, 0, now())
  ON CONFLICT (user_id)
  DO UPDATE SET generation_count = 0, updated_at = now();
END;
$$;

-- Unique on user_id for upsert targets
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_plans_user_id_key') THEN
    ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_user_id_key UNIQUE (user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_generations_user_id_key') THEN
    ALTER TABLE public.user_generations ADD CONSTRAINT user_generations_user_id_key UNIQUE (user_id);
  END IF;
END $$;