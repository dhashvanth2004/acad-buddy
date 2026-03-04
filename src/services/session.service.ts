import { supabase } from "@/integrations/supabase/client";

export const sessionService = {
    // Student side
    async getStudentContacts(studentId: string) {
        const { data, error } = await supabase
            .from("mentor_contacts")
            .select(`
        id, mentor_id, message, created_at,
        mentor:profiles!mentor_id(user_id, full_name, avatar_url, department, subjects)
      `)
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },

    async getStudentSessions(studentId: string, status: string | string[]) {
        let query = supabase
            .from("sessions")
            .select(`
        id, mentor_id, scheduled_at, duration_minutes, status, subject,
        mentor:profiles!mentor_id(user_id, full_name, avatar_url)
      `)
            .eq("student_id", studentId);

        if (Array.isArray(status)) {
            query = query.in("status", status);
        } else {
            query = query.eq("status", status);
        }

        // Default sorting based on status type
        if (status === "completed" || (Array.isArray(status) && status.includes("completed"))) {
            query = query.order("scheduled_at", { ascending: false });
        } else {
            query = query.order("scheduled_at", { ascending: true });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getStudentReviewedSessions(studentId: string) {
        const { data, error } = await supabase
            .from("reviews")
            .select("session_id")
            .eq("student_id", studentId);

        if (error) throw error;
        return new Set(data.map((r) => r.session_id));
    },

    // Mentor side
    async getMentorSessions(mentorId: string) {
        const { data, error } = await supabase
            .from("sessions")
            .select(`
        id, student_id, scheduled_at, duration_minutes, status, subject, notes,
        student:profiles!student_id(user_id, full_name, avatar_url)
      `)
            .eq("mentor_id", mentorId)
            .order("scheduled_at", { ascending: true });

        if (error) throw error;
        return data;
    },

    async getMentorAvailability(mentorId: string) {
        const { data, error } = await supabase
            .from("mentor_availability")
            .select("*")
            .eq("mentor_id", mentorId);

        if (error) throw error;
        return data;
    },

    async updateSessionStatus(sessionId: string, status: string) {
        const { error } = await supabase
            .from("sessions")
            .update({ status })
            .eq("id", sessionId);

        if (error) throw error;
        return true;
    },

    async toggleAvailability(mentorId: string, dayOfWeek: number, startTime: string, endTime: string, existingId?: string, currentStatus?: boolean) {
        if (existingId && currentStatus !== undefined) {
            const { error } = await supabase
                .from("mentor_availability")
                .update({ is_available: !currentStatus })
                .eq("id", existingId);
            if (error) throw error;
            return true;
        } else {
            const { data, error } = await supabase
                .from("mentor_availability")
                .insert({
                    mentor_id: mentorId,
                    day_of_week: dayOfWeek,
                    start_time: startTime + ":00",
                    end_time: endTime + ":00",
                    is_available: true,
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }
};
