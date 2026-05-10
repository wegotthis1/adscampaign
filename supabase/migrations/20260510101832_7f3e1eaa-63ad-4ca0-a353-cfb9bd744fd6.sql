REVOKE ALL ON FUNCTION public.consume_generation(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_generation(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.provision_plan(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_generation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_generation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.provision_plan(uuid, text, integer) TO service_role;