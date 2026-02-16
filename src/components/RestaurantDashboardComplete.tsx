import { useState } from 'react';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { DashboardOverview } from './dashboard/DashboardOverview';
import { RestaurantManagement } from './dashboard/RestaurantManagement';
import { MenuManagement } from './dashboard/MenuManagement';
import { RestaurantDashboard } from './RestaurantDashboard';
import { ServicesManagement } from './dashboard/ServicesManagement';
import { ReviewsManagement } from './dashboard/ReviewsManagement';

interface RestaurantDashboardCompleteProps {
  restaurantId: number;
  restaurantName: string;
  onLogout: () => void;
}

export function RestaurantDashboardComplete({
  restaurantId,
  restaurantName,
  onLogout
}: RestaurantDashboardCompleteProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview restaurantId={restaurantId} />;
      case 'restaurant':
        return <RestaurantManagement restaurantId={restaurantId} />;
      case 'menu':
        return <MenuManagement restaurantId={restaurantId} />;
      case 'bookings':
        return (
          <div className="h-full overflow-y-auto">
            <RestaurantDashboard
              onBack={() => setActiveSection('overview')}
              restaurantId={restaurantId}
              restaurantName={restaurantName}
            />
          </div>
        );
      case 'services':
        return <ServicesManagement restaurantId={restaurantId} />;
      case 'reviews':
        return <ReviewsManagement restaurantId={restaurantId} />;
      default:
        return <DashboardOverview restaurantId={restaurantId} />;
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      restaurantName={restaurantName}
      onLogout={onLogout}
    >
      {renderSection()}
    </DashboardLayout>
  );
}