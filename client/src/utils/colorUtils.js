// Helper function to convert RGB to Hex
export const rgbToHex = (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

// Helper function to format RGB string
export const formatRgbString = (r, g, b) => `${r}, ${g}, ${b}`;

export const parseGradientString = (gradientString) => {
    const regex = /linear-gradient\(45deg, (#[0-9a-fA-F]{6}), (#[0-9a-fA-F]{6})\)/;
    const match = gradientString.match(regex);
    if (match && match.length === 3) {
        return [match[1], match[2]];
    }
    return null;
};

export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

// Helper function to generate a complementary color for the gradient
export const generateGradientFromBaseColor = (baseHex) => {
    // Convert hex to RGB
    let r = parseInt(baseHex.slice(1, 3), 16);
    let g = parseInt(baseHex.slice(3, 5), 16);
    let b = parseInt(baseHex.slice(5, 7), 16);

    // Create a lighter shade (e.g., 20% lighter)
    const lighten = (color) => Math.min(255, color + (255 - color) * 0.2);
    const lighterR = Math.round(lighten(r));
    const lighterG = Math.round(lighten(g));
    const lighterB = Math.round(lighten(b));

    const lighterHex = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    return [baseHex, lighterHex];
};
