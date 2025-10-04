'use client'

import { useRouter } from 'next/navigation';
import PrescriptionCard from './PrescriptionCard';

interface PrescriptionsListProps {
  prescriptions: any[];
}

export default function PrescriptionsList({ prescriptions }: PrescriptionsListProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 pl-0 md:pl-20">
      {prescriptions.map((prescription) => (
        <PrescriptionCard
          key={prescription.id}
          prescription={prescription}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
