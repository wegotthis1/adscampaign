 import { ReactNode, useState, useEffect } from "react";
 import { AuthContext } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [session, setSession] = useState<any>(null);
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     // Set up auth state listener BEFORE getting session
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (_event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
         setLoading(false);
       }
     );
 
     // Get initial session
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       setLoading(false);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signUp = async (email: string, password: string) => {
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: window.location.origin,
       },
     });
     return { error };
   };
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
     return { error };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
   };
 
   return (
     <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
       {children}
     </AuthContext.Provider>
   );
 }