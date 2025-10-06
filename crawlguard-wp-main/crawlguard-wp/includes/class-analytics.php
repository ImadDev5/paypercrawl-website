<?php
/**
 * Analytics Data Handler for CrawlGuard WP
 */

if (!defined('ABSPATH')) {
    exit;
}

class CrawlGuard_Analytics {
    
    /**
     * Get analytics data for specified period
     */
    public static function get_analytics_data($days = 30) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crawlguard_logs';
        
        // Ensure we don't exceed 90 days
        $days = min($days, 90);
        
        // Calculate date range
        $start_date = date('Y-m-d 00:00:00', strtotime("-$days days"));
        $end_date = date('Y-m-d 23:59:59');
        
        // Get revenue over time data
        $revenue_data = self::get_revenue_over_time($table_name, $start_date, $end_date);
        
        // Get bot type distribution
        $bot_type_data = self::get_bot_type_distribution($table_name, $start_date, $end_date);
        
        // Get hourly activity pattern
        $hourly_data = self::get_hourly_activity($table_name, $start_date, $end_date);
        
        // Get stats overview
        $stats_overview = self::get_stats_overview($table_name, $start_date, $end_date);
        
        return array(
            'revenueData' => $revenue_data,
            'botTypeData' => $bot_type_data,
            'hourlyData' => $hourly_data,
            'statsOverview' => $stats_overview
        );
    }
    
    /**
     * Get revenue data grouped by date
     */
    private static function get_revenue_over_time($table_name, $start_date, $end_date) {
        global $wpdb;
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                DATE(timestamp) as date,
                COUNT(*) as detections,
                SUM(revenue_generated) as revenue
            FROM $table_name
            WHERE timestamp BETWEEN %s AND %s
            AND bot_detected = 1
            GROUP BY DATE(timestamp)
            ORDER BY date ASC",
            $start_date,
            $end_date
        ));
        
        $data = array();
        foreach ($results as $row) {
            $data[] = array(
                'date' => date('M d', strtotime($row->date)),
                'detections' => (int)$row->detections,
                'revenue' => (float)$row->revenue
            );
        }
        
        // Fill in missing dates with zero values
        return self::fill_missing_dates($data, $start_date, $end_date);
    }
    
    /**
     * Get bot type distribution with counts and revenue
     */
    private static function get_bot_type_distribution($table_name, $start_date, $end_date) {
        global $wpdb;
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                COALESCE(bot_type, 'Unknown') as name,
                COUNT(*) as count,
                SUM(revenue_generated) as revenue
            FROM $table_name
            WHERE timestamp BETWEEN %s AND %s
            AND bot_detected = 1
            GROUP BY bot_type
            ORDER BY count DESC
            LIMIT 10",
            $start_date,
            $end_date
        ));
        
        $data = array();
        foreach ($results as $row) {
            $data[] = array(
                'name' => $row->name,
                'count' => (int)$row->count,
                'revenue' => (float)$row->revenue
            );
        }
        
        return $data;
    }
    
    /**
     * Get hourly activity pattern (0-23 hours)
     */
    private static function get_hourly_activity($table_name, $start_date, $end_date) {
        global $wpdb;
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                HOUR(timestamp) as hour,
                COUNT(*) as count
            FROM $table_name
            WHERE timestamp BETWEEN %s AND %s
            AND bot_detected = 1
            GROUP BY HOUR(timestamp)
            ORDER BY hour ASC",
            $start_date,
            $end_date
        ));
        
        // Create array with all 24 hours
        $hourly_data = array();
        for ($i = 0; $i < 24; $i++) {
            $hourly_data[$i] = array(
                'hour' => $i,
                'count' => 0
            );
        }
        
        // Fill in actual data
        foreach ($results as $row) {
            $hourly_data[(int)$row->hour]['count'] = (int)$row->count;
        }
        
        return array_values($hourly_data);
    }
    
    /**
     * Get overview statistics
     */
    private static function get_stats_overview($table_name, $start_date, $end_date) {
        global $wpdb;
        
        $stats = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as total_detections,
                SUM(revenue_generated) as total_revenue,
                AVG(revenue_generated) as average_revenue,
                COUNT(DISTINCT ip_address) as unique_ips
            FROM $table_name
            WHERE timestamp BETWEEN %s AND %s
            AND bot_detected = 1",
            $start_date,
            $end_date
        ));
        
        return array(
            'totalDetections' => (int)($stats->total_detections ?? 0),
            'totalRevenue' => (float)($stats->total_revenue ?? 0),
            'averageRevenue' => (float)($stats->average_revenue ?? 0),
            'uniqueIPs' => (int)($stats->unique_ips ?? 0)
        );
    }
    
    /**
     * Fill in missing dates with zero values
     */
    private static function fill_missing_dates($data, $start_date, $end_date) {
        $start = strtotime($start_date);
        $end = strtotime($end_date);
        
        $filled_data = array();
        $existing_dates = array();
        
        // Index existing data by date
        foreach ($data as $item) {
            $existing_dates[$item['date']] = $item;
        }
        
        // Fill all dates in range
        for ($date = $start; $date <= $end; $date = strtotime('+1 day', $date)) {
            $formatted_date = date('M d', $date);
            
            if (isset($existing_dates[$formatted_date])) {
                $filled_data[] = $existing_dates[$formatted_date];
            } else {
                $filled_data[] = array(
                    'date' => $formatted_date,
                    'detections' => 0,
                    'revenue' => 0
                );
            }
        }
        
        return $filled_data;
    }
    
    /**
     * Get recent activity (last 10 detections)
     */
    public static function get_recent_activity($limit = 10) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crawlguard_logs';
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                timestamp,
                ip_address,
                bot_type,
                action_taken,
                revenue_generated
            FROM $table_name
            WHERE bot_detected = 1
            ORDER BY timestamp DESC
            LIMIT %d",
            $limit
        ));
        
        $activity = array();
        foreach ($results as $row) {
            $activity[] = array(
                'time' => human_time_diff(strtotime($row->timestamp), current_time('timestamp')) . ' ago',
                'ip' => $row->ip_address,
                'bot' => $row->bot_type,
                'action' => $row->action_taken,
                'revenue' => (float)$row->revenue_generated
            );
        }
        
        return $activity;
    }
    
    /**
     * Get dashboard summary stats
     */
    public static function get_dashboard_stats() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crawlguard_logs';
        
        // Current month stats
        $start_of_month = date('Y-m-01 00:00:00');
        
        $stats = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as total_detections,
                SUM(revenue_generated) as total_revenue
            FROM $table_name
            WHERE timestamp >= %s
            AND bot_detected = 1",
            $start_of_month
        ));
        
        return array(
            'detections' => (int)($stats->total_detections ?? 0),
            'revenue' => (float)($stats->total_revenue ?? 0)
        );
    }
    
    /**
     * Clean up old logs (keep only last 90 days)
     */
    public static function cleanup_old_logs() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crawlguard_logs';
        
        $cutoff_date = date('Y-m-d 00:00:00', strtotime('-90 days'));
        
        $wpdb->query($wpdb->prepare(
            "DELETE FROM $table_name WHERE timestamp < %s",
            $cutoff_date
        ));
    }
}
