import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = () => {
    const [period, setPeriod] = useState(30);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        revenueData: [],
        botTypeData: [],
        hourlyData: [],
        statsOverview: {
            totalDetections: 0,
            totalRevenue: 0,
            averageRevenue: 0,
            uniqueIPs: 0
        }
    });

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'crawlguard_get_analytics',
                    nonce: crawlguardData.nonce,
                    period: period
                })
            });

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="crawlguard-spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="crawlguard-analytics-dashboard">
            {/* Period Selector */}
            <div className="analytics-controls">
                <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="analytics-period-select"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>

            {/* Stats Overview Cards */}
            <div className="stats-overview">
                <div className="stat-card">
                    <h3>Total Detections</h3>
                    <p className="stat-value">{data.statsOverview.totalDetections.toLocaleString()}</p>
                    <span className="stat-label">AI Bots Detected</span>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p className="stat-value">${data.statsOverview.totalRevenue.toFixed(2)}</p>
                    <span className="stat-label">Earnings Generated</span>
                </div>
                <div className="stat-card">
                    <h3>Average per Bot</h3>
                    <p className="stat-value">${data.statsOverview.averageRevenue.toFixed(4)}</p>
                    <span className="stat-label">Per Request</span>
                </div>
                <div className="stat-card">
                    <h3>Unique Sources</h3>
                    <p className="stat-value">{data.statsOverview.uniqueIPs}</p>
                    <span className="stat-label">Different IPs</span>
                </div>
            </div>

            {/* Revenue Over Time Chart */}
            <div className="chart-container">
                <h3>Revenue Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                            labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                            name="Revenue"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bot Detections Chart */}
            <div className="chart-container">
                <h3>Bot Detections Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="detections"
                            stroke="#82ca9d"
                            activeDot={{ r: 8 }}
                            name="Detections"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bot Types Distribution */}
            <div className="charts-row">
                <div className="chart-container half-width">
                    <h3>Bot Types (Bar Chart)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.botTypeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Detections">
                                {data.botTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container half-width">
                    <h3>Bot Types (Pie Chart)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.botTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {data.botTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hourly Activity Pattern */}
            <div className="chart-container">
                <h3>Hourly Activity Pattern</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => [value, 'Detections']}
                            labelFormatter={(label) => `Hour: ${label}:00`}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#00C49F" name="Detections" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue by Bot Type */}
            <div className="chart-container">
                <h3>Revenue by Bot Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.botTypeData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#FF8042" name="Revenue">
                            {data.botTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
