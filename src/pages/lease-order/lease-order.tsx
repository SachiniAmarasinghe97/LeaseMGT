import { useCallback, useEffect, useState } from "react";
import "./lease-order.scss";
import { useServiceProvider } from "../../providers/service-provider";
import ToastMessage from "../../utils/toast-message";
import LoaderSmall from "../../components/loader-small";
import { useParams } from "react-router-dom";

export default function LeaseOrder() {
  const [loading, setLoading] = useState(false);
  const [leaseOrder, setLeaseOrder] = useState<any>(null);
  const [leases, setLeases] = useState<any[]>([]);

  const { leaseService } = useServiceProvider();

  const params = useParams();
  const reference = params.reference ?? null;

  const loadDataAsync = useCallback(async () => {
    try {
      setLoading(true);
      if (reference) {
        const leaseOrder = await leaseService.getLeaseOrderAsync(reference);
        setLeaseOrder(leaseOrder ?? null);
        const leases = await leaseService.getLeasesAsync();
        setLeases(leases);
      }
    } catch (e: any) {
      ToastMessage.show("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [leaseService, reference]);

  useEffect(() => {
    const loadData = async () => {
      await loadDataAsync();
    };
    loadData();
  }, [loadDataAsync]);

  return loading ? (
    <LoaderSmall style={{ height: "50vh" }} />
  ) : leaseOrder ? (
    <div className="lease-order">
      {Object.entries(leaseOrder).map((en) => {
        const key = en[0];
        const val = en[1];
        return key === "leases" ? (
          <div key={key}>
            <div>Leases</div>
            {(val as any).map((l: any) => {
              const lease = leases.find((x) => x.reference === l);
              return Object.entries(lease).map((e) => {
                const k = e[0];
                const v = e[1];
                return (
                  <div key={k}>
                    <div>{k}</div>
                    <div>{v as string}</div>
                  </div>
                );
              });
            })}
          </div>
        ) : (
          <div key={key}>
            <div>{key}</div>
            <div>{val as string}</div>
          </div>
        );
      })}
    </div>
  ) : (
    <div>No lease policy found</div>
  );
}
