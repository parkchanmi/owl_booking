import React from 'react';
import { Space } from 'antd';
import './AdminPageToolbar.css';

const AdminPageToolbar = ({ icon, title, description, children }) => (
    <div className="admin-page-toolbar">
        <div className="admin-page-toolbar-info">
            <span className="admin-page-toolbar-icon">{icon}</span>
            <div>
                <div className="admin-page-toolbar-title">{title}</div>
                {description && <div className="admin-page-toolbar-label">{description}</div>}
            </div>
        </div>
        <Space wrap size={8} className="admin-page-toolbar-actions">
            {children}
        </Space>
    </div>
);

export default AdminPageToolbar;
