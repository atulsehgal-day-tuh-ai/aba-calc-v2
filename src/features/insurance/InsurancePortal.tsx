import { useState } from 'react';
import { TabBar } from '../../components/TabBar.tsx';
import { Layout } from '../../components/Layout.tsx';
import { QueueTab } from './QueueTab.tsx';
import { PolicyCalcTab } from './PolicyCalcTab.tsx';
import { DecisionsTab } from './DecisionsTab.tsx';
import { PolicyConfigTab } from './PolicyConfigTab.tsx';
import { Inbox, Calculator, Scale, Settings } from 'lucide-react';

const TABS = [
  { key: 'queue', label: 'Review Queue', icon: <Inbox size={18} /> },
  { key: 'policycalc', label: 'Policy Calc', icon: <Calculator size={18} /> },
  { key: 'decisions', label: 'Decisions', icon: <Scale size={18} /> },
  { key: 'config', label: 'Policy Config', icon: <Settings size={18} /> },
];

export function InsurancePortal() {
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <Layout sidebar={<TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} color="insurance" />}>
      {activeTab === 'queue' && <QueueTab />}
      {activeTab === 'policycalc' && <PolicyCalcTab />}
      {activeTab === 'decisions' && <DecisionsTab />}
      {activeTab === 'config' && <PolicyConfigTab />}
    </Layout>
  );
}
