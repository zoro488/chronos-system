/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    PROFIT - Banco con Firestore Real-Time                  ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import BancoIndividualPageV2 from './BancoIndividualPageV2';

export default function ProfitPage() {
  return (
    <BancoIndividualPageV2
      bancoId="profit"
      bancoName="Profit"
      bancoIcon="💰"
      bancoColor="from-indigo-500 to-indigo-600"
    />
  );
}
