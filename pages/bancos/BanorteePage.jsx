/**
 * BANORTE - Página del Banco con Firestore Real-Time
 */
import BancoIndividualPageV2 from './BancoIndividualPageV2';

export default function BanorteePage() {
  return (
    <BancoIndividualPageV2
      bancoId="banorte"
      bancoName="Banorte"
      bancoIcon="🏦"
      bancoColor="from-red-500 to-red-600"
    />
  );
}
