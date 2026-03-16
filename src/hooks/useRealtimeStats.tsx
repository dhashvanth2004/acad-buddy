import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/error-logger';

export const useRealtimeStats = () => {
  const [stats, setStats] = useState({
    mentors: 0,
    sessions: 0,
    averageRating: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        // 1. Try to fetch from RPC first to get global counts bypassing RLS
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_platform_stats');

        if (!rpcError && rpcData) {
          const typedData = rpcData as { mentors: number; sessions: number; averageRating: number; subjects: number };
          if (mounted) {
            setStats({
              mentors: typedData.mentors || 0,
              sessions: typedData.sessions || 0,
              averageRating: typedData.averageRating || 0,
              subjects: typedData.subjects || 0
            });
          }
          return;
        }

        // 2. Fallback: If RPC doesn't exist (e.g., migrations not pushed), fetch public data only
        // Note: we do NOT fetch sessions/reviews locally here because RLS will cause diff values
        // between logged-in (sees own sessions) and logged-out (sees 0).
        let mentorsCount = 0;
        let subjectsCount = 0;

        try {
          const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor');
          mentorsCount = count || 0;
        } catch (e) {
            logger.error("Failed fetching mentors count", e as Error, { component: "useRealtimeStats" });
        }

        try {
          const { data: subjectsData } = await supabase.from('profiles').select('subjects').eq('role', 'mentor').not('subjects', 'is', null);
          const uniqueSubjects = new Set();
          if (subjectsData) {
            subjectsData.forEach(p => {
              if (p.subjects && Array.isArray(p.subjects)) p.subjects.forEach(s => uniqueSubjects.add(s));
            });
          }
          subjectsCount = uniqueSubjects.size;
        } catch (e) {
            logger.error("Failed fetching subjects count", e as Error, { component: "useRealtimeStats" });
        }

        if (mounted) {
          setStats({
            mentors: mentorsCount,
            sessions: 0, // Fallback hard reset to avoid "diff values" due to RLS context
            averageRating: 0, 
            subjects: subjectsCount
          });
        }
      } catch (error) {
        logger.error("Failed to fetch realtime stats", error as Error, { component: "useRealtimeStats" });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading };
};
