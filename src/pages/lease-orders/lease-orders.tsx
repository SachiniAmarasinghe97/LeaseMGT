import React, { useEffect, useState } from "react";
import "./lease-orders.scss";
import { useServiceProvider } from "../../providers/service-provider";
import LoaderSmall from "../../components/loader-small";

export default function LeaseOrders() {
  const [loading, setLoading] = useState<boolean>(true);
  const [leases, setLeases] = useState<any[]>([]);
  const [leaseOrders, setLeaseOrders] = useState<any[]>([]);

  const { leaseService } = useServiceProvider();

  useEffect(() => {
    const loadDataAsync = async () => {
      setLoading(true);
      try {
        const leases = await leaseService.getLeasesAsync();
        setLeases(leases);
        const leaseOrders = await leaseService.getLeaseOrdersAsync();
        setLeaseOrders(leaseOrders);
      } finally {
        setLoading(false);
      }
    };
    loadDataAsync();
  }, [leaseService]);

  return (
    <div className="lease-orders-page">
      <h1>Lease Policies</h1>
      {loading ? (
        <LoaderSmall />
      ) : (
        <div>
          {JSON.stringify(leases)}
          {JSON.stringify(leaseOrders)}
        </div>
      )}
    </div>
  );
}
