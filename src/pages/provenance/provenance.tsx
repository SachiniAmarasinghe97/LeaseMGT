import "./provenance.scss";
import { useServiceProvider } from "../../providers/service-provider";
import { useEffect, useState } from "react";
import Loader from "../../components/loader/loader";
import DateTimeHelper from "../../helpers/date-time-helper";
import { useParams } from "react-router-dom";
import ToastMessage from "../../utils/toast-message";
import UtilHelper from "../../utils/util-helper";
import { BatchHistoryOrderGrouped } from "../../models/batch-history";

export default function Provenance() {
  const [loading, setLoading] = useState(true);
  const { provenanceService } = useServiceProvider();
  const [provenanceHistory, setProvenanceHistory] = useState<BatchHistoryOrderGrouped | null>(null);

  const params = useParams();
  const reference = params.reference ?? null;

  // url format: http://localhost:3000/provenance/d74810b4-8575-4f63-80b3-a725098a53c5
  useEffect(() => {
    const loadDataAsync = async () => {
      setLoading(true);
      try {
        if (!reference) throw new Error("Export order reference is not specified");
        const batchHistory = await provenanceService.getExportOrderProvenanceAsync(reference);
        setProvenanceHistory(batchHistory);
      } catch (e) {
        ToastMessage.show(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadDataAsync();
  }, [provenanceService, reference]);

  const hasValidHistory = (history: any[]) => history && !(history.length === 1 && !history[0].scanTime);

  return (
    <div className="container p-5">
      {loading ? (
        <Loader />
      ) : (
        <div className="content">
          <div className="summary-card">
            <h6>Reference: {provenanceHistory?.exportOrder?.reference}</h6>
            <h2>{provenanceHistory?.tenantName}</h2>
          </div>
          {provenanceHistory?.batchHistories.map((batchHistory, index) => (
            <div key={index} className="content batch-card">
              <div className="summary-card">
                <h6>{batchHistory?.batch.reference}</h6>
                <p>
                  {batchHistory?.batch.product?.name} ({batchHistory?.batch.product?.refCode})
                </p>
                <p>
                  <i> {batchHistory?.batch.product?.description}</i>{" "}
                </p>
              </div>
              {hasValidHistory(batchHistory.history) ? (
                <div className="results-container">
                  {batchHistory.history.map((item, index2) => (
                    <div key={index2} className="card">
                      <h3>
                        {index2 + 1}. {item.stage.name}
                      </h3>
                      <p>📍 {item.stage.location}</p>
                      {item.stage.description && <p>📓 {item.stage.description}</p>}
                      <p>
                        📅{" "}
                        {item.scanTime
                          ? DateTimeHelper.formatDateTime(DateTimeHelper.convertToLocalDateTimeString(item.scanTime), "DD/MM/YYYY")
                          : "No date available"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No provenance info found</p>
                </div>
              )}
            </div>
          ))}
          {provenanceHistory?.exportOrder?.nFTokenId && (
            <a href={UtilHelper.getNftLink(provenanceHistory?.exportOrder?.nFTokenId)} target="_blank" rel="noreferrer">
              View NFT: {provenanceHistory?.exportOrder?.nFTokenId}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
