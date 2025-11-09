import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Slider,
    TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { generateRandomGradientColors } from '../services/colorService';
import { rgbToHex, hexToRgb, parseGradientString } from '../utils/colorUtils';

function ColorPickerDialog({ open, onClose, board, onSave }) {
    const theme = useTheme();
    const [gradientStartColor, setGradientStartColor] = useState({ r: 255, g: 255, b: 255 });
    const [gradientEndColor, setGradientEndColor] = useState({ r: 255, g: 255, b: 255 });
    const [activeColor, setActiveColor] = useState('start'); // 'start' or 'end'
    const [gradientInputString, setGradientInputString] = useState('');

    useEffect(() => {
        if (board && board.data.gradientColors && board.data.gradientColors.length === 2) {
            const [startHex, endHex] = board.data.gradientColors;
            const startRgb = hexToRgb(startHex);
            const endRgb = hexToRgb(endHex);
            if (startRgb && endRgb) {
                setGradientStartColor(startRgb);
                setGradientEndColor(endRgb);
                setGradientInputString(`linear-gradient(45deg, ${startHex}, ${endHex})`);
            }
        } else {
            setGradientStartColor({ r: 255, g: 255, b: 255 });
            setGradientEndColor({ r: 255, g: 255, b: 255 });
            setGradientInputString('');
        }
    }, [board]);

    const handleColorChange = (e) => {
        const { name, value } = e.target;
        let newStartColor = gradientStartColor;
        let newEndColor = gradientEndColor;

        if (activeColor === 'start') {
            newStartColor = { ...gradientStartColor, [name]: Number(value) };
            setGradientStartColor(newStartColor);
        } else {
            newEndColor = { ...gradientEndColor, [name]: Number(value) };
            setGradientEndColor(newEndColor);
        }
        const startHex = rgbToHex(newStartColor.r, newStartColor.g, newStartColor.b);
        const endHex = rgbToHex(newEndColor.r, newEndColor.g, newEndColor.b);
        setGradientInputString(`linear-gradient(45deg, ${startHex}, ${endHex})`);
    };

    const handlePickRandomColors = () => {
        const newGradientColors = generateRandomGradientColors();
        const startRgb = hexToRgb(newGradientColors[0]);
        const endRgb = hexToRgb(newGradientColors[1]);
        if (startRgb && endRgb) {
            setGradientStartColor(startRgb);
            setGradientEndColor(endRgb);
            setGradientInputString(`linear-gradient(45deg, ${newGradientColors[0]}, ${newGradientColors[1]})`);
        }
    };

    const handleGradientStringChange = (e) => {
        const gradientString = e.target.value;
        setGradientInputString(gradientString);
        const colors = parseGradientString(gradientString);
        if (colors) {
            const [startColor, endColor] = colors;
            const startRgb = hexToRgb(startColor);
            const endRgb = hexToRgb(endColor);
            if (startRgb && endRgb) {
                setGradientStartColor(startRgb);
                setGradientEndColor(endRgb);
            }
        }
    };

    const handleSave = () => {
        const startHex = rgbToHex(gradientStartColor.r, gradientStartColor.g, gradientStartColor.b);
        const endHex = rgbToHex(gradientEndColor.r, gradientEndColor.g, gradientEndColor.b);
        onSave(board.id, [startHex, endHex]);
        onClose(); // Call onClose after successful save
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Select Background Color</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                    <Box
                        data-testid="start-color-box"
                        sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: `rgb(${gradientStartColor.r}, ${gradientStartColor.g}, ${gradientStartColor.b})`,
                            border:
                                activeColor === 'start' ? '2px solid ' + theme.palette.primary.main : '1px solid #ccc',
                            cursor: 'pointer',
                        }}
                        onClick={() => setActiveColor('start')}
                    />
                    <Box
                        data-testid="end-color-box"
                        sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: `rgb(${gradientEndColor.r}, ${gradientEndColor.g}, ${gradientEndColor.b})`,
                            border:
                                activeColor === 'end' ? '2px solid ' + theme.palette.primary.main : '1px solid #ccc',
                            cursor: 'pointer',
                        }}
                        onClick={() => setActiveColor('end')}
                    />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, mb: 2 }}>
                    <Typography variant="body2">
                        {rgbToHex(gradientStartColor.r, gradientStartColor.g, gradientStartColor.b)}
                    </Typography>
                    <Typography variant="body2">
                        {rgbToHex(gradientEndColor.r, gradientEndColor.g, gradientEndColor.b)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Button variant="outlined" onClick={handlePickRandomColors}>
                        Pick Random
                    </Button>
                </Box>
                <TextField
                    label="Paste linear-gradient code"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={2}
                    value={gradientInputString}
                    onChange={handleGradientStringChange}
                />
                <Box sx={{ width: '100%', mb: 3 }}>
                    <Typography gutterBottom>Red</Typography>
                    <Slider
                        name="r"
                        aria-label="Red"
                        value={activeColor === 'start' ? gradientStartColor.r : gradientEndColor.r}
                        onChange={handleColorChange}
                        min={0}
                        max={255}
                        valueLabelDisplay="auto"
                    />
                    <Typography gutterBottom>Green</Typography>
                    <Slider
                        name="g"
                        aria-label="Green"
                        value={activeColor === 'start' ? gradientStartColor.g : gradientEndColor.g}
                        onChange={handleColorChange}
                        min={0}
                        max={255}
                        valueLabelDisplay="auto"
                    />
                    <Typography gutterBottom>Blue</Typography>
                    <Slider
                        name="b"
                        aria-label="Blue"
                        value={activeColor === 'start' ? gradientStartColor.b : gradientEndColor.b}
                        onChange={handleColorChange}
                        min={0}
                        max={255}
                        valueLabelDisplay="auto"
                    />
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        height: '50px',
                        borderRadius: '4px',
                        background: `linear-gradient(45deg, rgb(${gradientStartColor.r}, ${gradientStartColor.g}, ${gradientStartColor.b}), rgb(${gradientEndColor.r}, ${gradientEndColor.g}, ${gradientEndColor.b}))`,
                        border: '1px solid #ccc',
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ColorPickerDialog;
