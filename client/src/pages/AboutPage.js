import React, { useState, useEffect } from 'react';
import { Box, Typography, Link, Avatar } from '@mui/material';
import aboutService from '../services/aboutService';
import clientPackageJson from '../../package.json';

function AboutPage() {
    const [serverVersion, setServerVersion] = useState('Loading...');

    useEffect(() => {
        const fetchServerVersion = async () => {
            try {
                const data = await aboutService.getServerVersion();
                setServerVersion(data.version);
            } catch (error) {
                setServerVersion('Error loading version');
            }
        };
        fetchServerVersion();
    }, []);

    return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1, pr: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    About Yokan
                </Typography>
                <Typography variant="body1" paragraph>
                    Yokan (予感) is a clean, intuitive Kanban board application designed for simplicity and ease of
                    self-hosting. Yokan provides a seamless experience for organizing tasks and managing projects
                    without the complexity you would find with the alternatives.
                </Typography>
                <Typography variant="body1" paragraph>
                    Yokan is created by: <strong>Julian I. Kamil</strong>
                </Typography>
                <Typography variant="body1" paragraph>
                    Copyright © 2025 Julian I. Kamil. All rights reserved.
                </Typography>

                <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 1 }}>
                    Versions
                </Typography>
                <Typography>Client: {clientPackageJson.version}</Typography>
                <Typography>Server API: {serverVersion}</Typography>
                <Typography>Connected to: {process.env.REACT_APP_SERVER_URL}</Typography>

                <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 1 }}>
                    Licenses
                </Typography>
                <Typography variant="body1">
                    Yokan is available under a dual license: AGPLv3 for free use, and a Commercial License for
                    organizations. See the{' '}
                    <Link
                        href="https://github.com/yokan-board/yokan-board/blob/main/LICENSE.AGPLv3"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        AGPLv3 License
                    </Link>{' '}
                    and{' '}
                    <Link
                        href="https://github.com/yokan-board/yokan-board/blob/main/LICENSE.COMMERCIAL"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Commercial License
                    </Link>{' '}
                    for more details.
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    For information on commercial use licensing, please email:{' '}
                    <Link href="mailto:yokan.board@gmail.com">yokan.board@gmail.com</Link>
                </Typography>
            </Box>
            <Avatar alt="Yokan Logo" src="/avatar.png" sx={{ width: 120, height: 120 }} />
        </Box>
    );
}

export default AboutPage;
