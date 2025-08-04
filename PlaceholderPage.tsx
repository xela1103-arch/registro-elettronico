

import React from 'react';
import Layout from './Layout';

interface PlaceholderPageProps {
    title: string;
    isDevUser?: boolean;
    onLogout?: () => void;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({title, isDevUser, onLogout}) => <Layout title={title} showBack backPath="/settings" isDevUser={isDevUser} onLogout={onLogout}>{`${title} page`}</Layout>;

export default PlaceholderPage;