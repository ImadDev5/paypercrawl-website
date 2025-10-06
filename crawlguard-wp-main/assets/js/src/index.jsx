import React from 'react';
import { createRoot } from 'react-dom/client';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// Initialize React dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('crawlguard-react-analytics');
    if (container) {
        const root = createRoot(container);
        root.render(<AnalyticsDashboard />);
    }
});
