// Color Mapping Reference for Oh Crêpe!
// Use this as a guide when updating component styles

const colorMapping = {
  // Old colors → New CSS variables
  
  // Primary colors
  '#2c3e50': 'var(--primary-brown)',    // Dark blue → Brown
  '#667eea': 'var(--accent-peach)',      // Purple → Peach
  '#764ba2': 'var(--accent-coral)',      // Purple → Coral
  
  // Accent colors  
  '#f39c12': 'var(--accent-peach)',      // Orange → Peach
  '#e67e22': 'var(--accent-coral)',      // Dark orange → Coral
  '#FFB347': 'var(--warning-orange)',    // Warning orange
  
  // Success colors
  '#27ae60': 'var(--success-green)',     // Green
  '#229954': 'var(--success-green)',     // Dark green
  '#d4edda': 'rgba(143, 188, 143, 0.2)', // Success bg
  '#155724': 'var(--success-green)',     // Success text
  
  // Error colors
  '#e74c3c': 'var(--error-red)',         // Red
  '#c0392b': 'var(--error-red)',         // Dark red
  '#CD5C5C': 'var(--error-red)',         // Indian red
  
  // Text colors
  '#7f8c8d': 'var(--text-light)',        // Gray text
  '#333': 'var(--text-dark)',             // Dark text
  
  // Background colors
  '#f5f7fa': 'var(--cream-bg)',          // Page background
  '#f8f9fa': 'var(--cream-bg)',          // Light background
  '#e9ecef': 'var(--soft-beige)',        // Soft background
  
  // Border colors
  '#ddd': 'var(--border-color)',         // Border
  '#eee': 'var(--border-color)',         // Light border
  
  // Status badge colors (warm palette)
  '#fff3cd': 'rgba(255, 182, 96, 0.2)',  // Pending background
  '#856404': 'var(--primary-brown)',      // Pending text
  '#cfe2ff': 'rgba(135, 206, 235, 0.2)', // Preparing background
  '#084298': 'var(--info-blue)',          // Preparing text
  '#d1e7dd': 'rgba(143, 188, 143, 0.2)', // Ready/Delivered background
  '#0f5132': 'var(--success-green)',      // Ready/Delivered text
  '#e7d1ff': 'rgba(255, 182, 193, 0.2)', // Out for delivery background
  '#5a0f84': 'var(--accent-pink)',        // Out for delivery text
  '#f8d7da': 'rgba(205, 92, 92, 0.2)',   // Cancelled background
  '#842029': 'var(--error-red)',          // Cancelled text
  
  // Other colors
  '#95a5a6': '#95a5a6',                   // Gray (unavailable) - keep as is
  'white': 'white',                        // White - keep as is
  'rgba(0, 0, 0, 0.1)': 'var(--shadow-light)',
  'rgba(0, 0, 0, 0.2)': 'var(--shadow-medium)',
};

/*
Usage instructions:
1. Replace hardcoded hex colors with CSS variables
2. Use var(--color-name) format
3. Keep semantic color names (success, error, warning)
4. Maintain accessibility contrast ratios
*/
