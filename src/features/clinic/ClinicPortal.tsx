import { useState } from 'react';
import { TabBar } from '../../components/TabBar.tsx';
import { Layout } from '../../components/Layout.tsx';
import { CalculatorTab } from './CalculatorTab.tsx';
import { ClaimsTab } from './ClaimsTab.tsx';
import { InsightsTab } from './InsightsTab.tsx';
import { Calculator, FileText, BarChart3 } from 'lucide-react';

const TABS = [
  { key: 'calculator', label: 'Calculator', icon: <Calculator size={18} /> },
  { key: 'claims', label: 'My Claims', icon: <FileText size={18} /> },
  { key: 'insights', label: 'Insights', icon: <BarChart3 size={18} /> },
];

export function ClinicPortal() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <Layout sidebar={<TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} color="clinic" />}>
      {activeTab === 'calculator' && <CalculatorTab />}
      {activeTab === 'claims' && <ClaimsTab />}
      {activeTab === 'insights' && <InsightsTab />}
    </Layout>
  );
}
