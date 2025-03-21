import { useCallback, useEffect, useState } from "react";
import "./lease-order.scss";
import { useServiceProvider } from "../../providers/service-provider";
import ToastMessage from "../../utils/toast-message";
import LoaderSmall from "../../components/loader-small";
import { useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

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
    <div className="lease-order-page">
      <Card className="lease-order-card">
        <Card.Body>
          <Card.Title>Lease Order Details <hr /></Card.Title>
          <div className="lease-order-details">
            <div className="detail-item">
              <strong>Reference:</strong> {leaseOrder.reference}
            </div>
            <div className="detail-item">
              <strong>Title:</strong> {leaseOrder.title}
            </div>
            <div className="detail-item">
              <strong>Description:</strong> {leaseOrder.description}
            </div>
            <div className="detail-item">
              <strong>Created On:</strong> {new Date(leaseOrder.createdAt).toLocaleString()}
            </div>
            <div className="detail-item">
              <strong>Leases:</strong>
              {(leaseOrder.leases ?? [])
                .map((leaseRef: string) => {
                  const lease = leases.find((l) => l.reference === leaseRef);
                  return lease?.title
                    ? `${lease.title} (${lease.description})`
                    : `${lease?.reference.slice(0, 10)}...`;
                })
                .join(", ")}
            </div>
            {Object.entries(leaseOrder).map(([key, value]) => {
              if (["reference", "title", "description", "createdAt", "leases"].includes(key)) return null;
              return (
                <div className="detail-item" key={key}>
                  <strong>{key === "nftId" ? "NFT ID" : key}:</strong> {value as string}
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    </div>
  ) : (
    <div>No lease policy found</div>
  );
}
