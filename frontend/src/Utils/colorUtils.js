export const getShadeGradient = (id) => {
    // If no ID is provided, return default primary gradient
    if (!id) return 'linear-gradient(135deg, var(--primary-gradient-from) 0%, var(--primary-gradient-to) 100%)';

    // Convert string ID to number if needed
    const numId = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;

    // 5 Shades defined in CSS
    const shadeIndex = (numId % 5) + 1;

    return `linear-gradient(135deg, var(--shade-${shadeIndex}-from) 0%, var(--shade-${shadeIndex}-to) 100%)`;
};

export const getShadeColor = (id) => {
    // If no ID is provided, return default primary color
    if (!id) return 'var(--primary)';

    // Convert string ID to number if needed
    const numId = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;

    // 5 Shades defined in CSS
    const shadeIndex = (numId % 5) + 1;

    return `var(--shade-${shadeIndex}-to)`;
};

export const getRoomTypeGradient = (room) => {
    if (room.is_saved || room.status === 'expired' || room.is_read_only) return 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)'; // Saved/Expired (Amber)
    if (room.is_quick_chat) return 'linear-gradient(135deg, #34D399 0%, #059669 100%)'; // Quick Chat (Emerald)

    // Default: Use one consistent Violet for all Standard Rooms
    return 'linear-gradient(135deg, #8B5CF6 0%, #4C1D95 100%)';
};
