// src/api/attendance.ts
import { getSupabaseClient, isSupabaseEnabled } from '../lib/supabase';
import { formatISO, startOfDay, endOfDay } from 'date-fns';

export async function recordAttendance(
    employeeId: string,
    name: string,
    eventType: 'check_in' | 'check_out'
): Promise<void> {
    if (!isSupabaseEnabled) {
        console.info('Supabase not configured. Skipping cloud sync.');
        return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from('attendance')
        .insert([{ employee_id: employeeId, employee_name: name, event_type: eventType }]);

    if (error) throw error;
}

export async function fetchTodayAttendance() {
    if (!isSupabaseEnabled) {
        console.info('Supabase not configured. Cannot fetch live data.');
        return [];
    }

    const supabase = getSupabaseClient();
    const start = formatISO(startOfDay(new Date()));
    const end = formatISO(endOfDay(new Date()));

    const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .gte('timestamp', start)
        .lte('timestamp', end)
        .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
}
