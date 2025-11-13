/**
 * CHRONOS - Configuración Page
 */
import { getAuth } from 'firebase/auth';

import { MegaAIWidget } from '../components/ai/MegaAIWidget';
import { ContentSection, PageLayout } from '../components/layout/LayoutComponents';

const ConfiguracionPage = () => {
  return (
    <PageLayout>
      <ContentSection title="Configuración del Sistema">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Configuración</h2>
          <p className="text-white/60">Módulo en construcción</p>
        </div>
      </ContentSection>

      {/* 🤖 AI Assistant Widget */}
      <MegaAIWidget userId={getAuth().currentUser?.uid || 'demo-user'} position="bottom-right" />
    </PageLayout>
  );
};

export default ConfiguracionPage;

