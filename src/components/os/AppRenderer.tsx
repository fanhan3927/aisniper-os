/**
 * AppRenderer — appId → 实际 App 组件
 */
import React from 'react';
import type { AppId } from '../../types/os';
import { FinderApp } from '../apps/FinderApp';
import { CalculatorApp } from '../apps/CalculatorApp';
import { SettingsApp } from '../apps/SettingsApp';
import { TerminalApp } from '../apps/TerminalApp';
import { GameApp } from '../apps/GameApp';

export const AppRenderer: React.FC<{ appId: AppId }> = ({ appId }) => {
  switch (appId) {
    case 'finder':
      return <FinderApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'settings':
      return <SettingsApp />;
    case 'terminal':
      return <TerminalApp />;
    case 'game':
      return <GameApp />;
    default:
      return null;
  }
};
