export const parseMenuPermissions = (value, fallback = {}) => {
    let permissions = fallback;
    if (value) {
        try {
            permissions = { ...fallback, ...JSON.parse(value) };
        } catch {
            return fallback;
        }
    }

    if (permissions._salesMenuInitialized) return permissions;

    const upgraded = { ...permissions, _salesMenuInitialized: true };
    ['OWNER', 'MANAGER'].forEach((roleKey) => {
        const keys = permissions[roleKey];
        if (Array.isArray(keys) && keys.includes('ticket-list') && !keys.includes('sales')) {
            upgraded[roleKey] = [...keys, 'sales'];
        }
    });
    return upgraded;
};
