import React from 'react';
import { storiesOf } from '@storybook/react';
import Header from './Header';

storiesOf('common/Header', module)
    .add('Default', () => <Header />)
