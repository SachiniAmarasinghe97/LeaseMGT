import { useCallback, useEffect, useState } from "react";
import "./lease-orders.scss";
import { useServiceProvider } from "../../providers/service-provider";
import LoaderSmall from "../../components/loader-small";
import ToastMessage from "../../utils/toast-message";
import DateTimeHelper from "../../helpers/date-time-helper";
import UtilHelper from "../../utils/util-helper";

const metadataLinkPrefix: string = `${process.env.REACT_APP_API_URL}/lease-order-metadata` || "";

export default function LeaseOrders() {
  const [loading, setLoading] = useState<boolean>(true);
  const [leases, setLeases] = useState<any[]>([]);
  const [leaseOrders, setLeaseOrders] = useState<any[]>([]);

  const { leaseService, xrplService } = useServiceProvider();

  useEffect(() => {
    const loadDataAsync = async () => {
      setLoading(true);
      try {
        const leases = await leaseService.getLeasesAsync();
        setLeases(leases);
        const leaseOrders = await leaseService.getLeaseOrdersAsync();
        setLeaseOrders(leaseOrders);
      } catch (e: any) {
        ToastMessage.show("Failed to fetch lease orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadDataAsync();
  }, [leaseService]);

  const deleteLeaseOrder = useCallback(
    async (reference: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await leaseService.deleteLeaseOrderAsync(reference);
        if (res) {
          setLeaseOrders(leaseOrders.filter((order) => order.reference !== res.reference));
        } else {
          ToastMessage.show("Failed to delete lease order. Please try again.");
        }
      } catch (e: any) {
        console.log(e);
        ToastMessage.show("Failed to delete lease order. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [leaseOrders, loading, leaseService]
  );

  const createLeaseOrder = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const payload: any = {
      title: "test title",
      leases: leases.map((lease) => lease.reference),
    };

    try {
      const response = await leaseService.createLeaseOrderAsync(payload);
      if (response) {
        const res = await xrplService.mintNFT(Buffer.from(`${metadataLinkPrefix}/${response.reference}`).toString("hex").toUpperCase());
        const nftId = res?.result?.meta?.nftoken_id;
        if (nftId) {
          const updated = await leaseService.updateLeaseOrderNftAsync(response.reference, nftId);
          if (updated) {
            setLeaseOrders([updated, ...leaseOrders]);
          } else {
            setLeaseOrders([response, ...leaseOrders]);
            ToastMessage.show("Failed to create lease order. Please try again.");
          }
        } else {
          setLeaseOrders([response, ...leaseOrders]);
          ToastMessage.show("Failed to mint NFT. Please try again.");
        }
      } else {
        ToastMessage.show("Failed to save export order. Please try again.");
      }
    } catch (error) {
      console.log(error);
      ToastMessage.show("Failed to save export order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, leaseOrders, leases, leaseService, xrplService]);

  return (
    <div className="lease-orders-page">
      <h1>Lease Policies</h1>
      {loading ? (
        <LoaderSmall />
      ) : (
        <div>
          {JSON.stringify(leases)}
          <button onClick={() => createLeaseOrder()}>Create</button>
          {leaseOrders.map((order) => (
            <div key={order.reference}>
              <div>{order.reference}</div>
              <div>{order.title}</div>
              <div>{DateTimeHelper.convertToLocalDateString(new Date(order.createdAt))}</div>
              <div>{JSON.stringify(order.leases)}</div>
              {order.nftId && (
                <a href={UtilHelper.getNftLink(order.nftId)} target="_blank" rel="noreferrer">
                  {order.nftId}
                </a>
              )}
              <button onClick={() => deleteLeaseOrder(order.reference)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
